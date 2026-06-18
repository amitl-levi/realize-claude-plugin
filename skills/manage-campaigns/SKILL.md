---
name: manage-campaigns
description: Create and update Realize campaigns and native + display items via the Realize MCP write tools. Activates on any write-intent request — create, edit, pause/resume, launch, budget changes, bid changes, targeting edits, creative swaps. Enforces a tiered preview-then-confirm pattern with a mandatory account-identity header on every confirmation so the user always sees which account is being mutated. Falls back to a UI reference for actions the MCP does not currently expose (delete, duplicate, bulk operations). Grounded in the realize-toolkit's setup guidance and Taboola's official setup guide for the input-validation heuristics (Marketing Objective enum, Bid Strategy × budget minimums, learning-phase defaults).
allowed-tools: ["Read", "Bash", "AskUserQuestion"]
---

# Manage Campaigns

Writes for Realize campaigns and native + display items via MCP. Every destructive call is gated behind a preview and an explicit user confirmation; the preview always identifies the target account by name and opaque `account_id`. This skill is the only place in the plugin that calls the MCP write tools.

**Depth:** the full field-by-field MCP write-surface reference (every scalar on `create_campaign`, every field on `create_native_item` / `create_display_item`, per-strategy bid-lever gates, common payload patterns, failure modes) lives in `references/mcp-write-surface.md`. Read it when a payload needs detailed field coverage or when debugging a write rejection.

## When to use

Trigger on any of: *create, make, set up, launch, edit, update, change, pause, resume, duplicate, clone, delete, remove, bump the budget, raise the bid, lower CPC, swap the creative, add an ad, add a creative, target X, exclude Y*.

If the user is *asking* about a campaign rather than changing it, route to the `campaigns` skill (reads only). If the user is *diagnosing* performance, route to `optimize-campaign` — that skill hands write prescriptions back here.

## Prerequisites

- `account_id` resolved via the `accounts` skill. If missing, hand off there first.
- For **updates**, the relevant `get_campaign` / `get_item` read MUST precede the write — both to render a diff preview and (for `update_campaign` targeting blocks) to merge client-side so the full-replace semantics do not wipe dimensions the user didn't mention.

## Tools this skill wraps

| Tool | Required params | Idempotent? | Notes |
|---|---|---|---|
| `mcp__realize-mcp__create_campaign` | `account_id`, `name`, `marketing_objective`, `branding_text`, `spending_limit_model`, `bid_strategy` | No | Atomic. Ships PAUSED unless `is_active=true`. 15 optional targeting blocks (full-replace within block). |
| `mcp__realize-mcp__update_campaign` | `account_id`, `campaign_id` | Yes | **Scalars partial-merge**; **targeting blocks full-replace within a section**. At least one updatable field required. |
| `mcp__realize-mcp__create_native_item` | `account_id`, `campaign_id`, `url`, `title`, `description`, `thumbnail_url` | No | Optional `branding_text`, `cta`. New items typically PENDING_APPROVAL → RUNNING. |
| `mcp__realize-mcp__update_native_item` | `account_id`, `campaign_id`, `item_id` | Yes | At least one updatable field required. |
| `mcp__realize-mcp__create_display_item` | `account_id`, `campaign_id`, `url`, `creative_name`, plus either `ad_tag` (3P JS) or `asset_url` + `dimensions` (1P-hosted) | No | Locks campaign as Display on first call when `pricing_model=CPC`. 3P tags must match the validator allowlist (no `<!DOCTYPE>` / `<html>` wrapper). |
| `mcp__realize-mcp__update_display_item` | `account_id`, `campaign_id`, `item_id` | Yes | At least one updatable field required. Arrays like `verification_pixel` are full-replace. |

For previews and merges, this skill also reads `mcp__realize-mcp__get_campaign` and `mcp__realize-mcp__get_item`.

### Pricing model picks the campaign type — locked at creation

A campaign's ad type (Native vs Display) is locked at creation and cannot be switched later. Two MCP paths:

- **`pricing_model=CPC`** (standard, the default) — type stays undetermined until the **first item-creation call**. `create_native_item` locks the campaign as Native; `create_display_item` locks it as Display. Mixing item types under one campaign is rejected.
- **`pricing_model=VCPM`** (alternate, Display only) — locks the campaign as Display at the `create_campaign` call itself.

If the user wants Display, ask which path before creating: VCPM lock-in vs CPC-with-Display-item-first. If they don't care, default to `pricing_model=CPC` and call `create_display_item` first.

### Per-strategy bid-lever gates — refuse invalid combinations

The MCP will accept invalid combinations silently (some fields are ignored on certain strategies). Refuse them at preview time instead:

- `cpc` (scalar bid) — only on `bid_strategy=SMART` (Enhanced CPC) or `bid_strategy=FIXED` (see `knowledge/bidding.md` L62–66).
- `cpa_goal` — only on `bid_strategy=TARGET_CPA`.
- `cpc_cap` — valid only on `bid_strategy=MAX_CONVERSIONS` (last-resort ceiling; sending it on `TARGET_CPA` / `MAX_VALUE` / `SMART` / `FIXED` returns API 400). See `knowledge/bidding.md`.
- `publisher_bid_modifier` — only on **Enhanced CPC** or **Fixed Bid**. On `MAX_CONVERSIONS` / `TARGET_CPA` / `MAX_VALUE`, the only per-publisher lever is **block / unblock / whitelist** via `publisher_targeting`. Surfacing a per-publisher bid move on those strategies is a forbidden pattern — re-frame as a block.
- Per-item bid changes don't exist on any Realize strategy. Reframe as pause / activate / create / duplicate.

## Scope confirmation — refuse confirmation-skip framings and ambiguous-target requests

Two upstream gates apply **before** any preview is rendered. They protect the confirmation pattern from being short-circuited by user framing.

### Refuse confirmation-skip framings

If the user says any of *"don't ask before each one"*, *"no need to confirm"*, *"just apply the change and tell me after"*, *"skip the preview"*, *"auto-mode"*, *"apply them all"* — or any close paraphrase — the skill MUST refuse the framing. Pre-authorization in chat is not a substitute for the per-write confirmation gate. Reply with:

> "I'll still confirm each change before applying it — the preview-then-confirm gate is per-write and isn't bypassable, even with pre-authorization. Want me to start with the first change?"

Then proceed normally, one write at a time, each with its own `AskUserQuestion` confirm step. Never collapse multiple writes into a single bulk confirmation, and never run the writes back-to-back inside a single tool block.

### Confirm scope before fanning out

If the request can reasonably map to multiple targets — multiple campaigns, multiple items, multiple accounts — confirm the exact scope with the user **before** rendering any preview. Examples of ambiguous-target asks:

- *"Create 3 ad variations on account X"* — without a named campaign or item, the plugin must NOT default to "apply across all of the user's campaigns". Ask which campaign(s) — and how many items per campaign — before any write.
- *"Apply the budget bump to my campaigns"* — confirm whether the user means one specific campaign, a named list, or "all running campaigns"; if all, enumerate them in the preview before each one.
- *"Pause the worst performers"* — confirm the selection criterion (CPA threshold? click count? campaign vs item?) and the resulting list before any pause.

Scope confirmation uses `AskUserQuestion` with concrete options drawn from the user's account data (e.g., *"Which campaign — A, B, or C?"*, or *"All 4 running campaigns, or pick a subset?"*). Default expansion ("all of them") is forbidden unless the user explicitly confirms it.

## Confirmation pattern (tiered)

The skill never submits a write without first showing the user a preview and getting an explicit confirmation via `AskUserQuestion`. Tiers matched to risk:

| Action | Preview tier |
|---|---|
| `create_campaign`, `create_native_item` | Full preview |
| `update_campaign`, `update_native_item` (non-`is_active`) | Diff preview |
| `update_native_item` (`is_active` toggle only) | One-line confirm |

Three special cases layer on top: `update_campaign` touching a targeting block adds a full-replace warning; `update_native_item` runs a status check before previewing; `create_campaign` states the launch state explicitly. Detail in the workflow sections below.

### Mandatory: `▶ WRITE TARGET` header on every confirmation

Every preview block — including the one-line `is_active` confirm — MUST lead with this line, formatted exactly:

```
▶ WRITE TARGET: <account_name> (<account_id>)
```

The values come from the `search_accounts` result for the current session. Do not abbreviate the account name. Do not coerce or reformat the opaque `account_id`. Do not omit the header on the grounds that the account was mentioned earlier in the conversation — every individual write decision gets its own visible target. If the header would be missing, refuse to render the preview and re-resolve the account first.

This is the only account-scope safeguard the skill enforces. No separate first-write gate is introduced; the per-write header is the chokepoint.

### Confirmation flow shape

```
1. Resolve / validate inputs (including account_id via search_accounts).
2. For updates: get_campaign or get_item to capture current state.
3. Render the preview, leading with the ▶ WRITE TARGET header.
4. Ask via AskUserQuestion: "Submit this write?" with options Yes / No / Edit.
5. On Yes → call the write tool.
6. On No → drop the change; do not silently retry.
7. On Edit → restart input collection from step 1 with the edited values.
```

Never submit a write tool call before step 5. Never construct payloads from inferred or assumed values — every field comes from the user, from a read tool, or from validated defaults documented below.

## Creating a campaign

### 1. Collect inputs

Use `AskUserQuestion` for any required field the user did not supply. Validate against the enums and rules below before constructing the payload.

**Required fields:**

| Field | Accepted values | Notes |
|---|---|---|
| `name` | Any text | Internal identifier. |
| `marketing_objective` | `BRAND_AWARENESS`, `DRIVE_WEBSITE_TRAFFIC`, `LEADS_GENERATION`, `ONLINE_PURCHASES`, `MOBILE_APP_INSTALL` | See enum guidance below. |
| `branding_text` | Any text | Shown publicly under each item — "site name or product you're promoting". |
| `spending_limit_model` | `NONE`, `MONTHLY`, `ENTIRE` | If `MONTHLY` or `ENTIRE`, `spending_limit` is also required. |
| `bid_strategy` | `SMART`, `FIXED`, `TARGET_CPA`, `MAX_CONVERSIONS`, `MAX_VALUE` | Drives the budget minimums — see below. |

**Common optional scalars:**

| Field | Notes |
|---|---|
| `spending_limit`, `daily_cap` | In the account's default currency — pull via `search_accounts` before quoting amounts. |
| `cpc`, `cpa_goal`, `cpc_cap` | In the account's default currency. |
| `start_date`, `end_date` | ISO `YYYY-MM-DD`. |
| `is_active` | Bool. Default behavior is PAUSED. See the **Create-with-launch flow** below. |
| `daily_ad_delivery_model` | `BALANCED` (default; smooths spend across the day — forbids `daily_cap`) or `STRICT` (caps daily spend tightly — requires `daily_cap`). |
| `traffic_allocation_mode` | `OPTIMIZED` or `EVEN`. |

**Marketing Objective enum — user-facing descriptions** (use these when asking the user which to pick):

- `BRAND_AWARENESS` — *"Increase awareness of your brand."*
- `DRIVE_WEBSITE_TRAFFIC` — *"Increase user engagement and page views."*
- `LEADS_GENERATION` — *"Drive leads such as email sign-ups."*
- `ONLINE_PURCHASES` — *"Get people to buy your products."*
- `MOBILE_APP_INSTALL` — *"Get people to install your app."*

**Bid Strategy × Budget minimums** (Taboola-published; enforce before submitting):

| Bid Strategy | Minimum daily budget |
|---|---|
| `MAX_CONVERSIONS` | **10× the CPA goal** per day (learning-phase stability with conversion optimization). |
| `TARGET_CPA` | **10× the CPA goal** per day ($50/day minimum if CPA < $5). Same floor as `MAX_CONVERSIONS` — see `knowledge/bidding.md`. |
| `SMART` (Enhanced CPC) | **5× the CPA goal** per day, with a **150× CPA monthly** minimum. |
| `FIXED` | Set per your campaign requirements; no published Taboola minimum. |
| `MAX_VALUE` | Set per your campaign requirements; surface the formula but don't block on a hard minimum unless a CPA goal is supplied. |

For non-conversion campaigns (objective = `BRAND_AWARENESS` / `DRIVE_WEBSITE_TRAFFIC`): target **100–200 clicks per day** as the minimum data volume. Budget = `cpc × desired_clicks_per_day`. Example: $0.50 CPC × 100–200 clicks/day → $50–$100/day.

If the user supplies a budget below the relevant minimum, refuse the submission, write the math out loud (`$25 CPA × 10 = $250/day minimum`), and ask them to either raise the budget or pick a different bid strategy. Do not silently submit an under-funded campaign.

**Targeting recommendation at launch:** Leave targeting broad on a fresh campaign — narrow only after real performance data exists. If the user pre-narrows aggressively, surface the toolkit's "stay broad at launch" guidance once and let the user override.

### 2. Render preview and confirm

```
▶ WRITE TARGET: <account_name> (<account_id>)

About to call create_campaign with:
  name: "<name>"
  marketing_objective: <enum>
  branding_text: "<branding_text>"
  spending_limit_model: <enum>
  bid_strategy: <enum>
  daily_cap: <amount> <currency>      # if supplied
  cpa_goal: <amount> <currency>       # if supplied
  cpc: <amount> <currency>            # if supplied
  start_date: <YYYY-MM-DD>            # if supplied
  end_date: <YYYY-MM-DD>              # if supplied
  is_active: <true|false>
  <targeting blocks, one per line if supplied>

Launch state: <PAUSED until Realize approves → will not run until you explicitly set it active>
            | <Will launch automatically once Realize approves (24–48h review)>
```

Then `AskUserQuestion`: "Submit this `create_campaign` call?" Options: Yes / Edit / Cancel.

### 3. Submit and verify

On Yes, call `create_campaign`. The response includes the new `campaign_id` and the full campaign state. Echo the `campaign_id` back to the user and remind them that any edit (including the launch toggle, if PAUSED) re-enters the 24–48 hour review queue. Offer to call `get_campaign` after the review window to confirm the API-of-record state.

## Create-with-launch flow

Default is PAUSED. Set `is_active=true` only when the user *explicitly* says so — phrases like "launch it", "set it active", "go live", "start it running". When that intent is present:

- Include `is_active=true` in the create payload.
- The preview's launch-state line MUST surface the launch intent: *"Will launch automatically once Realize approves (24–48h review)."*
- The `AskUserQuestion` prompt must explicitly call out the launch — e.g., "Submit this `create_campaign` call? (The campaign will start running automatically once Realize approves it — 24–48h review.)"

If the user did not explicitly say to launch, set `is_active=false` (or omit, since PAUSED is the API default) and surface the PAUSED state in the preview. After the create succeeds, you may offer the launch as a follow-up: *"Want me to set it active now via `update_campaign(is_active=true)`?"* — that's a separate write with its own confirmation gate.

## Updating a campaign

### Scalars only (e.g., budget bump, bid change, name change)

1. Resolve `account_id`, `campaign_id`.
2. Call `get_campaign` to capture current state.
3. Render diff preview:
   ```
   ▶ WRITE TARGET: <account_name> (<account_id>)

   About to call update_campaign on campaign_id=<id> ("<name>") with:
     <field>: <old> → <new>
     <field>: <old> → <new>
   ```
4. `AskUserQuestion`: "Submit this `update_campaign` call?" Yes / Edit / Cancel.
5. On Yes, call `update_campaign`. Echo the response. Remind that the edit re-enters the 24–48h review.

### Targeting blocks (geo, device, OS, browser, connection, audience, lookalike, contextual, publisher, dayparting, conversion-rules)

The full-replace gotcha: each targeting block is partial-merge at the section level (sending `region_country_targeting` alone does not affect `country_targeting`), but **within** a section, the values are full-replace — sending `country_targeting={include:['CA']}` *replaces* the include list with `['CA']` and deletes everything else.

Mandatory pattern:

1. Resolve `account_id`, `campaign_id`.
2. Call `get_campaign` and **read the current targeting block** the user wants to touch.
3. Merge the user's change into the current list client-side. Examples:
   - "Also target Canada" with current `country_targeting.include=['US']` → merged value `['US','CA']`.
   - "Remove Florida" with current `region_country_targeting.include=['FL','TX','NY']` → merged value `['TX','NY']`.
4. Render the preview with the full-replace warning:
   ```
   ▶ WRITE TARGET: <account_name> (<account_id>)

   About to call update_campaign on campaign_id=<id> ("<name>").

   ⚠ Targeting full-replace — this overwrites the entire <block> section.
   Current <block>: [ ... ]
   After update:    [ ... ]
   ```
5. `AskUserQuestion`: "Submit this `update_campaign` call?" Yes / Edit / Cancel.
6. On Yes, call `update_campaign` with the FULL merged block.

Never construct a targeting block payload without rendering the side-by-side `Current → After update` view in the preview — the user catches accidental deletions there.

#### Publisher block-list edits — recipe

Publisher block / unblock / whitelist requests ("block ESPN on this campaign", "unblock NYTimes", "whitelist these 3 sites") are the most common optimization-side write. They route through `update_campaign.publisher_targeting` — there is **no dedicated `update_blocklist` MCP tool**. The full-replace gotcha above applies.

`publisher_targeting` shape: `{type: INCLUDE|EXCLUDE|ALL, value: ["<publisher_id_string>", ...]}`. **Values are strings**, not integers — feed the publisher ID strings returned by `search_publishers` verbatim; the MCP validator rejects integers. `EXCLUDE` is a block list, `INCLUDE` is a whitelist (approved-list mode), `ALL` clears the gate.

Mandatory chain:

1. Resolve the publisher names → IDs via `search_publishers(account_id, query=...)`. Never accept a publisher name as the write input; the field expects the publisher ID **strings** returned by `search_publishers` — pass them verbatim, do not coerce to int.
2. Call `get_campaign(account_id, campaign_id)` and read the current `publisher_targeting` block.
3. Merge:
   - **Block** ("block ESPN") with current `{type:"EXCLUDE", value:["site_10","site_12"]}` and resolved ESPN id `="site_14"` → merged `{type:"EXCLUDE", value:["site_10","site_12","site_14"]}`.
   - **Unblock** ("unblock site_12") with current `{type:"EXCLUDE", value:["site_10","site_12","site_14"]}` → merged `{type:"EXCLUDE", value:["site_10","site_14"]}`.
   - **Switch to whitelist** ("only allow ESPN, NYT") — confirm the user understands the side-effect of moving from EXCLUDE-mode to INCLUDE-mode (everything not on the list stops serving) before previewing.
4. Run the **historical-top-N block guard** from `knowledge/site-management.md` on every publisher about to be blocked. If a candidate-to-block is currently a top performer, surface the warning and ask the user to confirm before continuing.
5. Render the preview with the side-by-side current → after view:
   ```
   ▶ WRITE TARGET: <account_name> (<account_id>)

   About to call update_campaign on campaign_id=<id> ("<name>").

   ⚠ Targeting full-replace — this overwrites the entire publisher_targeting section.
   Current publisher_targeting: {type: "EXCLUDE", value: ["site_10", "site_12"]}
   After update:                {type: "EXCLUDE", value: ["site_10", "site_12", "site_14"]}

   Resolved names:
     + site_14  ESPN Network - ESPN.com
   ```
6. `AskUserQuestion`: "Submit this `update_campaign` call?" Yes / Edit / Cancel.
7. On Yes, call `update_campaign(account_id, campaign_id, publisher_targeting={...full merged block...})`.
8. Verify with a follow-up `get_campaign` — confirm the new block-list state matches what was previewed.

Never call `update_campaign(publisher_targeting=...)` without reading the existing block first. The full-replace semantics mean an unmerged write deletes every pre-existing block / whitelist entry the user didn't restate — silently.

## Creating a native item

1. Resolve `account_id`, `campaign_id` (the item attaches to an existing campaign).
2. Collect required fields via `AskUserQuestion`: `url`, `title`, `description`, `thumbnail_url`. Optional: `branding_text` (inherits from campaign if omitted), `cta` (look up valid values via the `discovery` skill → `list_cta_types`).
3. Render the preview:
   ```
   ▶ WRITE TARGET: <account_name> (<account_id>)

   About to call create_native_item on campaign_id=<id> ("<campaign_name>") with:
     title: "<title>"
     url: "<url>"
     thumbnail_url: "<thumbnail_url>"
     description: "<description>"
     cta: <cta>                # if supplied
     branding_text: "<...>"    # if supplied
   ```
4. `AskUserQuestion` → submit on Yes.
5. After the call, the response contains the new `item_id` and typical initial status `PENDING_APPROVAL`. Offer to verify via `get_item` once review completes.

## Updating a native item

Status gates which fields can be edited. The skill enforces this before previewing:

```
1. Resolve account_id, campaign_id, item_id.
2. Call get_item(account_id, campaign_id, item_id).
3. Inspect item.status:
   - REJECTED → refuse: "This item is REJECTED — Realize will not accept edits.
                Want me to create a replacement item via create_native_item instead?"
                Stop here.
   - RUNNING or PAUSED → only is_active + minor metadata are editable.
     If the user's requested change touches title / url / description / thumbnail / cta:
       refuse the substantive edit. Offer the alternative:
         a) toggle the existing item to is_active=false via update_native_item,
         b) create a replacement via create_native_item.
   - PENDING_APPROVAL → all fields editable; proceed.
4. Render preview tier appropriate to the change:
   - is_active toggle only → one-line confirm:
     "▶ WRITE TARGET: <account_name> (<account_id>) — Pause item <id> ('<title>')? [y/N]"
   - non-is_active edits → full diff preview as in the scalar-update pattern above.
5. AskUserQuestion → submit on Yes.
```

For `update_native_item` arrays (`verification_pixel`, `viewability_tag`): the array fields are full-replace within their section. To edit one entry, read with `get_item`, modify locally, send the merged result.

## Creating a display item

Display items attach to a Display campaign (or to a `pricing_model=CPC` campaign that has no items yet — see the **Pricing model picks the campaign type** note above).

1. Resolve `account_id`, `campaign_id`. Confirm with `get_campaign` that the campaign is Display (or undetermined under `pricing_model=CPC`). If it's already locked as Native, refuse: *"This campaign is locked as Native — Display items can't be added. Want me to create a new Display campaign instead?"*
2. Collect required fields via `AskUserQuestion`. Two recipes:
   - **3P JS tag (programmatic / verification-tagged):** `ad_tag` (must start at character 0 — no `<!DOCTYPE>`, no `<html>` / `<body>` / `<div>` wrapper, no leading whitespace; tag must pass the per-vendor validator server-side), `dimensions` (single-entry array, e.g., `[{"width": 300, "height": 250}]`), `creative_name`, `url` (landing page).
   - **1P-hosted display:** `asset_url` (image / animated asset hosted on your CDN or uploaded to Realize), `dimensions`, `creative_name`, `url`.
3. Optional: `branding_text` (inherits from campaign if omitted), `verification_pixel` (DV / IAS impression pixel), `viewability_tag` (DV / IAS viewability tag).
4. Render the preview:
   ```
   ▶ WRITE TARGET: <account_name> (<account_id>)

   About to call create_display_item on campaign_id=<id> ("<campaign_name>") with:
     creative_name: "<name>"
     url: "<url>"
     dimensions: [{width: 300, height: 250}]
     ad_tag: "<first 80 chars>…"            # OR asset_url: "<url>"
     branding_text: "<...>"                 # if supplied
     verification_pixel: "<...>"            # if supplied
     viewability_tag: "<...>"               # if supplied
   ```
5. `AskUserQuestion` → submit on Yes.
6. After the call, the response contains the new `item_id` and typical initial status `PENDING_APPROVAL`. Two distinct 400s can come back from `create_display_item` — read the error message body and route accordingly:
   - **`400 Unsupported tag`** → the 3P vendor is not configured for this account. **Stripping the wrapper will not fix it.** Route the user to their Account Manager (or `support@taboola.com`) to request vendor enablement; do not retry.
   - **`400 Invalid html tag structure`** → the markup is malformed or wrapped (`<!DOCTYPE>`, `<html>`, `<body>`, `<div>`, leading whitespace). Strip everything before the first ad-tag element and retry.

## Updating a display item

Same status-gated pattern as `update_native_item`:

```
1. Resolve account_id, campaign_id, item_id.
2. Call get_item(account_id, campaign_id, item_id).
3. Inspect item.status:
   - REJECTED → refuse: "This item is REJECTED — Realize will not accept edits.
                Want me to create a replacement item via create_display_item instead?"
                Stop here.
   - RUNNING or PAUSED → only is_active + minor metadata are editable.
     If the user's requested change touches ad_tag / asset_url / dimensions / creative_name:
       refuse the substantive edit. Offer the alternative:
         a) toggle the existing item to is_active=false via update_display_item,
         b) create a replacement via create_display_item.
   - PENDING_APPROVAL → all fields editable; proceed.
4. Render preview tier appropriate to the change (same tiers as update_native_item).
5. AskUserQuestion → submit on Yes.
```

For `update_display_item` arrays (`verification_pixel`, `viewability_tag`): same full-replace-within-section semantics as `update_native_item`. Read with `get_item`, modify locally, send the merged result.

## Post-write verification

Every write changes a resource that needs Realize approval (24–48 hours) before it goes live. After any successful write, offer the verification step:

- Pull `get_campaign(account_id, campaign_id)` to confirm the API-of-record matches the preview the user approved. Both params required — never call `get_campaign` with only `campaign_id`.
- Pull `list_items(account_id, campaign_id)` to confirm new/updated items are attached.
- For pauses/resumes, confirm the `status` field on the campaign or `is_active` on the item.

If `get_campaign` returns the prior state immediately after a save, wait a minute and retry once — there can be brief lag between the write and read paths.

## UI fallback — actions the MCP does not expose

These remain Realize-UI-only. Do not fabricate tools for them. **Do not fabricate deeplink URLs either** — the Realize UI's URL structure has not been formally captured for the plugin, so a guessed link will 404. Use the menu paths below verbatim and let the user navigate.

### Delete a campaign

Realize UI → Campaigns → row's overflow menu (⋯) → **Delete**.

For most "remove this" intents, the MCP-supported alternative is `update_campaign({is_active: false})` — the campaign stops running but is preserved. Offer that path first; only direct the user to the UI for true deletion.

### Duplicate a campaign

Realize UI → Campaigns → row's overflow menu (⋯) → **Duplicate** → edit the copy's name, budget, targeting → **Continue**.

The duplicated campaign re-enters the 24–48 hour review.

### Bulk operations

Multi-select pause/resume/edit operations on the Campaigns or Items list are UI-only. The MCP write tools handle one entity at a time. For "pause everything except X", surface that there's no batch API and offer to either (a) script the per-entity calls one by one (each gets its own confirmation) or (b) point the user to the UI for the bulk action.

## Gotchas

- **Never accept "skip the confirmation" framings.** If the user says *"no need to ask before each one"* / *"just apply"* / *"skip the preview"* / *"auto-mode"*, refuse the framing and proceed one write at a time with the normal per-write confirm. See the **Scope confirmation** section above. Pre-authorization in chat is not a substitute for the per-write gate.
- **Never fan out a write across multiple targets without explicit scope confirmation.** *"Create 3 ad variations"* with no named campaign does NOT mean "apply to every campaign in the account". Ask which campaign(s) and how many items per campaign before any write fires.
- **Never pretend a write happened.** If the model is unsure whether a write completed (network blip, ambiguous response), do not claim success. Re-read via `get_campaign` / `get_item` and surface what's actually there.
- **Never submit a write before the `AskUserQuestion` gate.** No "I'll just create it and confirm afterward." The confirmation is the safeguard; bypassing it is the trust-breaker.
- **Never omit the `▶ WRITE TARGET` header.** It is the only account-scope safeguard. Missing header → refuse to render the preview and re-resolve the account.
- **Never bypass the Bid Strategy × Budget minimums.** A $10/day campaign with a $20 CPA goal will waste the $10 — Taboola published those minimums because below them the algorithm cannot stabilize.
- **Never narrow targeting at launch to "focus on the right users".** It's the opposite of Taboola's guidance — narrow only after data shows which segments underperform.
- **Never coerce opaque IDs.** `account_id`, `campaign_id`, and `item_id` come from the API as strings. Pass them through verbatim — no numeric casting, no re-casing, no stripping.
- **Always source currency from `search_accounts`.** Monetary scalars (`daily_cap`, `cpc`, `cpa_goal`, etc.) are in the account's default currency. Do not assume USD.
- **`update_campaign` targeting touches MUST be preceded by `get_campaign`.** Full-replace semantics mean a partial block silently deletes the dimensions the user didn't mention.
- **`update_native_item` is status-gated.** Skipping the `get_item` status check risks attempting an edit that the server will reject (REJECTED items) or accept but fail to apply (RUNNING/PAUSED items receiving non-`is_active` fields, depending on the field).
- **Review cycle applies to edits, not just creation.** Every successful write re-enters the 24–48 hour review queue. Set that expectation in the post-write message.
- **Data may lag briefly** in MCP results after a write. If `get_campaign` returns the prior state right after a save, wait a minute and retry once — once.
