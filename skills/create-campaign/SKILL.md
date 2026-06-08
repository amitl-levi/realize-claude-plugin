---
name: create-campaign
description: Create, edit, pause, resume, or duplicate Realize campaigns and ad items via the MCP write tools (`create_campaign`, `create_native_item`, `create_display_item`, `update_campaign`, `update_native_item`, `update_display_item`). Falls back to a Realize UI walkthrough only for actions the MCP doesn't yet expose (Custom Rules, conversion rules, audience uploads). Enforces the paused-on-create + two-gate activation pattern, runs a 12-item pre-write self-eval, refuses invalid bid-lever combinations, and prints a plain-text activation receipt. Activates on "create a campaign", "launch this", "set up a new Native campaign", "create 3 Display items with these tags", "pause this campaign", "duplicate this campaign with a higher budget", "edit the daily budget on campaign X", etc.
allowed-tools: ["Read", "Bash", "AskUserQuestion"]
---

# Create Campaign

End-to-end Realize campaign and item creation / editing via the MCP. Default path is MCP write tools with a strict paused-on-create + two-gate activation discipline. Realize UI walkthrough is the fallback for actions the MCP doesn't yet expose.

**Depth:** the full field-by-field MCP write-surface reference (every scalar on `create_campaign`, every field on `create_native_item` / `create_display_item`, per-strategy bid-lever gates, discovery-tool table) lives in `references/mcp-write-surface.md`. Read it when a payload needs detailed field coverage.

## When to use

- "Create a new campaign for [advertiser]" / "Set up a Native campaign" / "Launch a Display campaign with these 3P JS tags"
- "Add N new items to campaign X"
- "Edit the daily budget on campaign X" / "Change the bid strategy" / "Update the targeting"
- "Pause campaign X" / "Resume campaign X" / "Pause item Y"
- "Duplicate campaign X with a higher budget"
- "Block these publishers" (via `update_campaign(publisher_targeting=...)`)

If the user asks to diagnose an underperforming live campaign, route to `optimize-campaign` instead.

## Two paths — MCP-first by default

The Realize MCP exposes these write tools:

| Tool | Purpose |
|---|---|
| `create_campaign` | New campaign (paused on initial create) |
| `update_campaign` | Edit any campaign field, including `is_active` for pause / resume and `publisher_targeting` for site blocks |
| `create_native_item` | Add a Sponsored Content (Native) ad item |
| `create_display_item` | Add a Display ad item (1P-hosted or 3P JS tag) |
| `update_native_item` | Edit a Native item, including `is_active` for pause / resume |
| `update_display_item` | Edit a Display item, including `is_active` for pause / resume |

For these actions, use the MCP path below (Steps 0–8). For actions **not** in the MCP today, use the UI fallback section at the bottom: Custom Rules, conversion-rule creation, CRM-segment upload, lookalike-seed creation, audience uploads.

## Prerequisites

- `account_id` resolved via the `accounts` skill (the opaque string from `search_accounts`, not a numeric ID).
- For Native vs Display decisions, the user has told you which format they need — or you've asked. Campaign type is **locked at creation** (see `knowledge/campaign-structure.md` and `knowledge/creative.md`); you cannot switch later. Two MCP paths to set the type:
  - **`pricing_model=CPC`** (standard) — type is undetermined until the first item-creation call. `create_display_item` locks the campaign as Display; `create_native_item` locks it as Native.
  - **`pricing_model=VCPM`** (alternate, Display only) — locks the campaign as Display at the `create_campaign` call itself.

## Activation principle — paused-on-create, two-door activation

Every campaign + item is created in **paused** state (`is_active=false`) on the first pass. A separate confirmation gate flips them to active. **Two doors, not one.** This holds for all MCP-driven campaign + item creates. UI-fallback actions (Custom Rules, conversion rules, CRM uploads, lookalike seeds) follow Realize UI's own confirmation flow — they don't have a paused-vs-active state to gate.

## Resolution-before-write discipline

This is the no-write phase. Every value referenced must be resolved against the live account. Don't invent IDs.

| Field type | Resolver tool |
|---|---|
| `account_id` | `search_accounts` (guard against a wrong-account write) |
| Geo codes (country / region / DMA / city / postal) | `search_geos` |
| Audience segments | `search_audiences` / `search_lookalike_audiences` / `search_contextual_segments` |
| Publisher allow / block list | `search_publishers` |
| Conversion rules | `search_conversion_rules` |
| CTA values | `list_cta_types` |
| Time zone for dayparting | `list_time_zones` |
| OS / browser targeting | `search_techno` |

If any reference cannot be resolved (e.g., a publisher name in the request returns no match), surface the gap as a **single batched question** before proceeding — don't ask one field at a time.

## MCP path — the 8 steps

**Edit-only / pause-only / resume-only requests skip Steps 6–7.** The full 8-step workflow assumes new-campaign creation (with the activation gate + activation receipt). For *"pause campaign X"* / *"change the daily budget on campaign Y"* / *"unblock publisher Z on campaign W"* — already-live campaigns being edited — the workflow collapses to: Step 0 (confirm intent) → Step 1 (resolve IDs) → Step 2 (build the `update_*` payload) → Step 3 (modified pre-write self-eval — only the items that apply to an edit) → a single confirmation block (combined Step 4) → Step 5 (execute the update) → readback (modified Step 7 — just confirm the change took effect, no activation receipt). The two-gate pattern is for create flows; existing-live edits go through a single confirmation gate.

### Step 0 — Confirm intent

Confirm in one sentence what's about to happen: *"Creating 3 campaigns + 9 items on account `<account_id>`, all paused on creation."* If the user's request is ambiguous, ask one clarifying question before going further.

### Step 1 — Resolve every code / ID before any write

Walk the resolution table above. Run discovery tools in parallel where possible. Collect all resolved IDs + values. If anything is unresolved, batch the gap into a single question.

### Step 2 — Build the create payloads (in memory, not yet sent)

For each planned campaign, assemble the full `create_campaign` payload + the list of `create_native_item` / `create_display_item` payloads. Apply the bid-lever gates:

- `cpc` only on `bid_strategy=FIXED`.
- `cpa_goal` only on `bid_strategy=TARGET_CPA`.
- `cpc_cap` valid on all strategies (last-resort lever on Maximize Conversions / Target CPA / Maximize Value — see `knowledge/bidding.md` "Bid Ceiling for Maximize Conversions").
- `publisher_bid_modifier` only on Enhanced CPC / Fixed Bid (per the bid-lever matrix in `knowledge/bidding.md`).
- `is_active=false` on every campaign and every item at this stage.

Full required-scalars + targeting-block list is in `references/mcp-write-surface.md`. Per-strategy gates also live there.

### Step 3 — Pre-write self-eval (mandatory, runs silently)

Before sending any write, verify:

- [ ] Each campaign payload has the required `create_campaign` scalars: `account_id`, `name`, `marketing_objective`, `branding_text`, `spending_limit_model`, `bid_strategy`.
- [ ] `is_active=false` on every campaign.
- [ ] Daily budget ≥ 10× CPA goal (Maximize Conversions) or ≥ 5× CPA goal (Enhanced CPC) — see `knowledge/budget.md`.
- [ ] No `cpc` field on a non-FIXED campaign; no `cpa_goal` on a non-TARGET_CPA campaign.
- [ ] No `publisher_bid_modifier` on Maximize Conversions / Target CPA / Maximize Value.
- [ ] No mixing of Native + Display items in one campaign (campaign type is locked at creation).
- [ ] Every display item has `ad_tag` (or `asset_url` for 1P-hosted), single-entry `dimensions`, and `creative_name`.
- [ ] Every native item either has full creative fields (`title`, `description`, `thumbnail_url`) or omits all three to trigger server-side crawl.
- [ ] Every item under a campaign respects the campaign's marketing objective + targeting (item-level targeting doesn't exist; consistency is at campaign level).
- [ ] Every UTM / `tracking_code` value matches the input exactly.
- [ ] Every conversion-rule reference resolves to an existing rule on the account.
- [ ] No EXCLUDE on a publisher flagged top-N historical without surfacing the flag for explicit user confirmation (see `knowledge/site-management.md`).

If any check fails, fix the payload (or ask the user) before sending writes.

### Step 4 — Batch confirmation (single yes / no)

Present the full plan in one block. List every campaign + item count. One `yes` proceeds; anything else cancels.

```
About to write 3 campaigns + 9 items to Realize, all paused on creation:

  Campaign A: account_id=<id>, MAX_CONVERSIONS, $75/day cap, US national, Premium only
       → 3 Native items, 1 conversion rule attached

  Campaign B: account_id=<id>, TARGET_CPA cpa_goal=$25, …
       → 3 Native items

  Campaign C: account_id=<id>, FIXED cpc=$0.40, VCPM Display, …
       → 3 Display items, 300x250 + 300x600

Confirm to proceed with all 3 campaigns? (yes / no)
```

### Step 5 — Execute writes (paused state)

Run the writes in this order. Stop on any failure and surface immediately — don't try to "fix and retry" silently.

1. For each campaign:
   1. `create_campaign(...)` with `is_active=false`. Capture returned `campaign_id`.
   2. For each item in that campaign: `create_native_item(...)` or `create_display_item(...)` against the new `campaign_id`. Capture returned `item_id` values.
2. After all campaigns + items are created, run a **single readback**: `get_all_campaigns` + per-campaign `get_campaign_items` to confirm what's now on the account matches what was promised in Step 4.

### Step 6 — Activation gate (separate confirmation)

A second confirmation block, distinct from Step 4:

```
3 campaigns + 9 items created and paused on account <id>. Ready to activate?

  Campaign A (Campaign ID: <id>) → 3 items
  Campaign B (Campaign ID: <id>) → 3 items
  Campaign C (Campaign ID: <id>) → 3 items

Confirm to launch all 3 campaigns? (yes / no)
```

On `yes`, run `update_campaign(is_active=true)` per campaign. Items inherit campaign-level activation; confirm each item's `is_active` is also `true` and `update_*_item(is_active=true)` if not.

### Step 7 — Activation receipt

Output a plain-text receipt in the terminal:

```
ACTIVATION RECEIPT — Account <account_id>
Created at: YYYY-MM-DD HH:MM:SS UTC

Campaign A
  Campaign ID:  <id>
  Status:       Running (activated YYYY-MM-DD HH:MM:SS UTC)
  Items:        <id>, <id>, <id>  (all Running)

Campaign B
  ...
```

### Step 8 — Closing prompt

Close with one question that hands off to follow-up work:

> "<N> campaigns are live on account `<account_id>`. Want me to check delivery once data starts coming in? Typical learning phase is **7–14 days** — wait for that to complete before requesting any optimisation analysis."

If the user wants to watch performance, hand off to the `reports` or `optimize-campaign` skill. If they want to launch another campaign, restart at Step 0.

## Marketing Objective enum (when user is choosing)

Pick one. Drives the algorithm's optimisation target. Cannot be changed after launch — create a new campaign if it was set wrong.

| Objective | When to use |
|---|---|
| **Brand Awareness** | Increase visibility and recall. New brands or product-launch information. |
| **Website Engagement** | Increase page views, clicks, or time spent on site. Driving qualified traffic or building warm audiences. |
| **Lead Generation** | Drive leads through email sign-ups, form fills, or demo requests. |
| **Online Purchases** | Drive purchases for a product or service. E-commerce or D2C. |
| **App Installs** | Drive mobile app installs. |

(Full guidance in `knowledge/campaign-structure.md`.)

## Bid Strategy × Budget — hard minimums

| Bid Strategy | Minimum daily budget | Also note |
|---|---|---|
| **Maximize Conversions** | **10× the CPA goal** per day | $50 minimum if CPA < $5. The right default for conversion-driven campaigns. |
| **Enhanced CPC** | **5× the CPA goal** per day | **150× CPA goal** monthly. |
| **Fixed Bid** | Per advertiser requirements | Manual bid control — only when complete bid control is required (regulated category, vCPM / CPM rate-card buys). |

For **non-conversion campaigns** (Brand Awareness / Website Engagement, where there's no CPA goal): target **100–200 clicks per day** as the minimum data volume. Budget = `expected CPC × desired clicks/day`. Example: $0.50 CPC × 100–200 clicks = $50–$100/day.

Refuse to set a budget below these minimums — the algorithm can't stabilise and the spend will churn through noise without producing actionable data.

Full bid-strategy guidance: `knowledge/bidding.md`. Budget pacing + 10× rule: `knowledge/budget.md`.

## Targeting recommendations — broad at launch

The platform's setup guidance explicitly recommends **not** narrowing targeting on a fresh campaign — it limits reach and starves the algorithm of data.

| Field | Recommendation for a new campaign |
|---|---|
| **Location** | Pick the country / market, then leave the regional layers (DMA, city, postal) **blank**. |
| **Platform** (Desktop / Mobile / Tablet) | Default per `knowledge/campaign-structure.md` — split into separate campaigns by platform group when budget allows (≥ ~$1k/day for MAX_CONVERSIONS or ~$5k total per split). Below that, bundle Desktop + Mobile + Tablet in one campaign. |
| **Connection Type / OS / Browser** | Leave blank at launch. These are *optimisation* levers for an existing campaign, not setup fields. |
| **Audience segments** | Leave blank at launch unless the user has a specific must-include audience. For Tier-1 markets, route via `knowledge/targeting.md`'s audience-strategy table after launch; for non-Tier-1, stay broad even longer (see the small-market caveat). |

## Creative recommendations

Per `knowledge/creative.md`:

- **4–6 ads per campaign, never more than 10.** Below 4 the algorithm has nothing to test; above 10, learning gets diluted.
- **3 distinct titles + 3 unique images per campaign** for performance advertisers.
- Titles + thumbnails must **pre-qualify the click** — match what the user will find on the landing page. Misleading creatives spike CTR and tank conversion.
- Avoid generic CTAs like *"Click Here"* or *"While Supplies Last"*. Use specific copy.
- For **Display campaigns with 3P JS tags**: see `knowledge/creative.md` for the validator allowlist and HTML-wrapper-stripping rules. Tags must start at offset zero (no `<!DOCTYPE>`, no `<html>`, no leading whitespace).

## Forbidden patterns

- **Activating without a separate yes / no confirmation.** Two gates: create-paused, then activate.
- **Bulk activation without listing each campaign in the confirmation block.** Listing forces visibility of what's about to flip live.
- **Creating before all read-resolutions complete.** Plans must be 100% resolved before any write.
- **Combining the create + activate steps into one MCP call.** Even if `is_active=true` worked on create, this skill forces the two-gate pattern for stage-friendly auditability.
- **Acting on "do what you think is best."** Never blanket authorisation. Propose, ask, then execute.
- **Per-item (per-creative / per-ad) bid changes.** They don't exist on any Realize bid strategy. Reframe as pause / activate / create / duplicate / edit (see `knowledge/bidding.md` Bid Levers matrix).
- **Per-publisher bid moves on Maximize Conversions / Target CPA / Maximize Value.** Only block / unblock / whitelist on these strategies.
- **EXCLUDE on a top-N historical publisher** without surfacing the flag and getting explicit user confirmation (see `knowledge/site-management.md`).
- **Narrowing targeting at launch** to "focus on the right users" — it's the opposite of platform guidance. Narrow *after* you have real data showing which segments underperform.

## Failure handling

Errors during the batch write:

1. **Surface the exact failure** — campaign or item ID, MCP error message verbatim.
2. **State which campaigns / items were created** before the failure (they remain paused).
3. **Ask the user how to proceed**: roll back (call `update_campaign(is_active=false)` or item equivalents and leave for cleanup), retry the failing call, or stop and triage.
4. **Never silently retry on writes.** Reads can retry with backoff; writes always require explicit user direction.

## Verification after the writes

After Step 5 readback (and again post-activation in Step 6):

- `get_campaign(account_id, campaign_id)` per campaign — confirm scalars + `is_active` state match.
- `get_campaign_items(account_id, campaign_id)` per campaign — confirm items are attached, with the expected statuses.
- `get_all_campaigns(account_id)` for the account-level rollup.

Data may lag briefly in MCP results after writes; if a `get_campaign` returns the old state seconds after a save, wait ~30 seconds and retry once.

## Realize UI fallback path

For actions where **no MCP write tool exists today**, walk the user through the Realize UI. Re-verify via MCP reads after they confirm.

| Action | Realize UI path |
|---|---|
| **Create / edit a Custom Rule** | Campaigns → Rules tab → +New. Only after the campaign has finished its 7-14 day learning phase (per `knowledge/custom-rules.md`). |
| **Create / edit a conversion rule** | Settings → Conversion Rules → +New. |
| **Upload a CRM segment** | Audiences → CRM → +New. Minimum 1,000 user records; available in select markets only (per `knowledge/targeting.md`). |
| **Create a lookalike seed** | Audiences → Lookalike → +New. US-based accounts for CRM Lookalike per `knowledge/targeting.md`. |
| **Build a contextual / interest audience** | Audiences → Contextual → browse marketplace. |
| **Apply Brand Safety pre-bid (DV / IAS)** | Campaigns → open campaign → Advanced Options → Brand Safety. One vendor per advertiser (per `knowledge/brand-safety.md`). |
| **Duplicate a campaign** | Campaigns → row overflow menu (⋯) → Duplicate. Edit the copy's name, budget, and any targeting changes; then **Continue** to submit for review. After 24–48 hour approval, verify via `get_campaign(account_id, new_campaign_id)` — the new campaign has a fresh `campaign_id` distinct from the source. *(Alternative MCP recipe for scripted duplication: pull the source via `get_campaign` + `get_campaign_items`, build a new `create_campaign` payload with the source values modified per user input, then run the 8-step workflow above.)* |

Re-verify via `get_campaign` after the user confirms the change is saved.

## Review cycle

Both MCP-driven creates and UI-driven edits trigger a **24–48 hour review window** before the campaign starts serving (or before an edit takes effect on a live campaign). Set this expectation up front so the user isn't surprised.

## Hand-off to the depth file

Read `references/mcp-write-surface.md` when:

- A payload needs detailed field coverage (every scalar on `create_campaign`, every targeting block, every item-level field).
- The per-strategy bid-lever gate needs the full validity matrix (which combinations are valid where).
- The discovery / readback tool table needs more detail than the Resolution section above.
- An edit is mapping back from a desired user-facing change to the right `update_*` field.

## Gotchas

- **Never pretend a write happened.** If a `create_*` returns an error, surface it. Fabricating a successful response is a trust-breaker.
- **Don't bypass the minimum budget rules.** A $10/day campaign with a $20 CPA goal will waste the $10 — the published minimums exist because below them the algorithm can't stabilise.
- **Don't invent Realize UI paths.** For UI steps not covered in the fallback table, direct the user to Realize documentation rather than guessing.
- **Don't recommend optimisation before the learning phase finishes.** Refer the user to `optimize-campaign` only after 7–14 days of delivery (per `knowledge/bidding.md` Learning-Period Guard).
- **Item-level targeting doesn't exist.** Targeting is set at the campaign level only. Don't propose "different geos per item" — propose separate campaigns instead.
