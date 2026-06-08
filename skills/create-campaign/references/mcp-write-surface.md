# MCP Write-Surface Reference

> Loaded by `skills/create-campaign/SKILL.md` when a payload needs detailed field coverage. The SKILL.md carries the workflow (8 steps, two-gate activation, pre-write self-eval, forbidden patterns); this file carries the per-tool field reference.

---

## 1. `create_campaign` — full scalar list

Required fields on every create call:

| Field | Type | Notes |
|---|---|---|
| `account_id` | string | The opaque account identifier from `search_accounts` — NOT the numeric `id`. Pass through verbatim; don't reformat. |
| `name` | string | Internal campaign name. See `knowledge/campaign-structure.md` for grouping + objective rules; no platform-imposed naming convention. |
| `marketing_objective` | enum | One of: `BRAND_AWARENESS`, `DRIVE_WEBSITE_TRAFFIC`, `LEADS_GENERATION`, `ONLINE_PURCHASES`, `MOBILE_APP_INSTALL`. Locked at create — cannot be changed via `update_campaign`. |
| `branding_text` | string | Shown publicly under each item. Use the brand name or product line. |
| `spending_limit_model` | enum | `DAILY` or `LIFETIME`. Drives whether `spending_limit` is a daily cap or total flight budget. |
| `bid_strategy` | enum | One of: `MAX_CONVERSIONS`, `TARGET_CPA`, `MAX_VALUE`, `SMART` (= Enhanced CPC in UI), `FIXED`. See Section 4 for the per-strategy field-gate matrix. |

Optional but commonly-set scalars:

| Field | Type | Used for |
|---|---|---|
| `spending_limit` | currency | The cap amount. Required when `spending_limit_model=DAILY` (daily cap) or `LIFETIME` (flight total). |
| `daily_cap` | currency | Lifetime-mode campaigns can still set a daily ceiling. |
| `cpc` | currency | Bid. **ONLY valid when `bid_strategy=FIXED`.** Reject the payload if set on any other strategy. |
| `cpa_goal` | currency | Target CPA. **ONLY valid when `bid_strategy=TARGET_CPA`.** Reject otherwise. |
| `cpc_cap` | currency | Optional ceiling on per-click cost. Valid on all strategies; last-resort lever on Maximize Conversions / Target CPA / Maximize Value (see `knowledge/bidding.md` "Bid Ceiling for Maximize Conversions"). |
| `target_roas` | number | Target ROAS multiple. Used with `MAX_VALUE`. |
| `start_date`, `end_date` | ISO date | Flight dates. Optional `end_date` means always-on. |
| `tracking_code` | string | UTM scheme / tracking parameters appended to outbound URLs. |
| `comments` | string | Internal notes — link to source plan / ticket. |
| `daily_ad_delivery_model` | enum | `BALANCED` (default) / `ACCELERATED`. Accelerated = Pace Ahead in UI. |
| `traffic_allocation_mode` | enum | Defaults to algorithm-driven. |
| `pricing_model` | enum | `CPC` (standard) or `VCPM` (Display only — locks campaign as Display at create time). See `knowledge/creative.md` for the two-path Native-vs-Display lock-in rule. |
| `is_active` | boolean | **Always `false` on initial create.** Flipped to `true` only after the activation gate (see SKILL.md Step 6). |

## 2. Targeting blocks on `create_campaign`

All optional; populate where the request specifies. Item-level targeting does not exist — all targeting is set here.

### Geo

**Country-level (`country_targeting`) is independent.** Among the sub-country dimensions (`region_country_targeting`, `dma_country_targeting`, `city_targeting`, `postal_code_targeting`), pick **at most one** per campaign — mutex applies within that group only. A campaign can have `country_targeting` AND one sub-country dimension simultaneously (e.g., country=US + city=[NYC, LA]); it cannot have two sub-country dimensions at once (e.g., region + city).

| Field | Shape | Resolver |
|---|---|---|
| `country_targeting` | `{type: INCLUDE|EXCLUDE|ALL, value: [ISO-2 codes]}` | `search_geos(dimension=countries)` |
| `region_country_targeting` | `{type: INCLUDE|EXCLUDE|ALL, value: [region IDs]}` | `search_geos(dimension=regions)` |
| `dma_country_targeting` | `{type: INCLUDE|EXCLUDE|ALL, value: [DMA codes]}` | `search_geos(dimension=dmas)` |
| `city_targeting` | `{type: INCLUDE|EXCLUDE|ALL, value: [city IDs]}` | `search_geos(dimension=cities)` |
| `postal_code_targeting` | `{type: INCLUDE|EXCLUDE|ALL, value: [postal codes]}` | `search_geos(dimension=postal_codes)` |

### Platform / device

| Field | Shape | Notes |
|---|---|---|
| `platform_targeting` | `{type: INCLUDE|EXCLUDE|ALL, value: [DESK|PHON|TBLT|TV|OTHR|NA]}` | Default per `knowledge/campaign-structure.md` — split by platform group when budget allows. |
| `os_targeting` | `{type, value: [OS names]}` | `search_techno(dimension=operating_systems)` |
| `browser_targeting` | `{type, value: [browser names]}` | `search_techno(dimension=browsers)` |
| `connection_type_targeting` | `{type, value: [WIFI|CELLULAR|...]}` | `search_techno(dimension=connection_types)` |

### Audience

| Field | Shape | Resolver |
|---|---|---|
| `audiences_targeting` | `{state: INCLUDE|EXCLUDE, value: [{type, value: [int IDs]}]}` | `search_audiences` (account-resident, e.g. pixel-built segments, CRM uploads) |
| `contextual_segments_targeting` | `{state, value: [{type, value: [int IDs]}]}` | `search_contextual_segments` (network-wide marketplace catalogue — demographics, interests, 3P data partners) |
| `lookalike_audience_targeting` | `{state, value: [{type: INCLUDE, value: [{rule_id, similarity_level}]}]}` | `search_lookalike_audiences` (account-resident lookalike seeds) |

### Supply / placement

| Field | Shape | Notes |
|---|---|---|
| `publisher_targeting` | `{type: INCLUDE|EXCLUDE|ALL, value: [publisher IDs]}` | `search_publishers`. Run the historical-top-N guard in `knowledge/site-management.md` before any EXCLUDE. |
| `publisher_bid_modifier` | `[{publisher_id, modifier_pct}]` | **ONLY valid on `SMART` (Enhanced CPC) or `FIXED`.** Reject on Maximize Conversions / Target CPA / Maximize Value. |
| `predefined_premium_site_targeting` | enum | `ALL` / `PREMIUM` / `REGULAR`. Confirm account permission before setting. |

### Conversion + dayparting

| Field | Shape | Notes |
|---|---|---|
| `conversion_rules` | `[{rule_id, ...}]` | Use `search_conversion_rules` to resolve. Required for performance objectives (ONLINE_PURCHASES / LEADS_GENERATION / MOBILE_APP_INSTALL) — see `knowledge/bidding.md` "When the conversion rule isn't ready yet" for the placeholder-rule recipe. |
| `activity_schedule` | `{time_zone, days: [{day, hours}]}` | Dayparting. `time_zone` resolved via `list_time_zones`. Don't apply at launch without data (per `knowledge/campaign-structure.md`). |

## 3. Item-level write tools

### `create_native_item` — Sponsored Content / Native

| Field | Type | Notes |
|---|---|---|
| `account_id`, `campaign_id` | string | Both required. |
| `url` | string | Landing-page URL. Required. |
| `title` | string | 60 characters, front-loaded value proposition. Either supply `title` + `description` + `thumbnail_url` together, OR omit all three to trigger server-side crawl. |
| `description` | string | Optional sub-headline. Same all-or-none rule with title + thumbnail. |
| `thumbnail_url` | string | Image URL. Same all-or-none rule. |
| `cta` | `{cta_type}` | Optional. `cta_type` resolved via `list_cta_types`. |
| `creative_name` | string | Always set — this is what the user sees in the UI. |
| `is_active` | boolean | **Always `false` on initial create.** |

### `create_display_item` — Display (1P-hosted or 3P JS tag)

| Field | Type | Notes |
|---|---|---|
| `account_id`, `campaign_id` | string | Both required. |
| `url` | string | Landing-page URL. Required. |
| `ad_tag` | string | Required for 3P JS tags. Raw HTML/JS string — must match the validator allowlist in `knowledge/creative.md`. **No `<!DOCTYPE>`, no `<html>`, no `<body>` / `<div>` wrapper, no leading whitespace.** First character must be `<`. |
| `asset_url` | string | Required for 1P-hosted display (uploaded image / motion file). Mutually exclusive with `ad_tag`. |
| `thumbnail_url` | string | Required for 1P-hosted display. Do NOT supply for 3P JS tags — the tag IS the creative. |
| `dimensions` | `[{width, height}]` | Single-entry array. Standard IAB sizes: 300×250, 300×600, 320×50, 728×90, 970×250, 160×600, 720×1280. |
| `creative_name` | string | Always set. |
| `verification_pixel` | string | DV / IAS verification pixel — optional third-party tag. |
| `viewability_tag` | string | DV / IAS viewability tag — optional. |
| `is_active` | boolean | **Always `false` on initial create.** |

### `update_native_item` / `update_display_item`

Same field shapes as the create tools. Use to:

- **Pause an item:** `update_*_item(is_active=false)`.
- **Activate an item:** `update_*_item(is_active=true)`.
- **Swap creative content:** edit `title` / `description` / `thumbnail_url` / `ad_tag` etc.
- **Update landing page:** edit `url`.

Item edits do not change the campaign's locked type — a Display item cannot be converted to Native by editing fields.

### `update_campaign`

Use to edit any campaign field after creation. Common patterns:

| Intent | Field(s) to update |
|---|---|
| Pause / resume campaign | `is_active` |
| Change daily budget | `spending_limit` (with `spending_limit_model=DAILY`) |
| Move budget cadence to lifetime | `spending_limit_model=LIFETIME` + `spending_limit` (total) |
| Block / unblock a publisher | `publisher_targeting` (full block-list — pass the new INCLUDE/EXCLUDE set) |
| Add per-publisher bid modifier (Enhanced CPC / Fixed Bid only) | `publisher_bid_modifier` |
| Tighten or broaden targeting | the relevant targeting block (`country_targeting`, `platform_targeting`, etc.) |
| Add a Target CPA on a Maximize Conversions campaign | switch `bid_strategy=TARGET_CPA` + set `cpa_goal`. **Last-resort lever** per `knowledge/bidding.md`; never at launch, never aspirational. |
| Add / change tracking | `tracking_code` |

Fields that CANNOT be changed after create:

- `marketing_objective` — re-create the campaign instead.
- `pricing_model` — re-create the campaign instead.
- Campaign type (Native vs Display) — derived from `pricing_model` + first attached item; locked at create. Re-create instead.
- `account_id` — never move a campaign between accounts.

## 4. Per-strategy bid-lever gate matrix

The canonical matrix lives in `knowledge/bidding.md` ("Bid Levers — What's Possible at Each Level"). Quick reference for write payloads:

| Action level | Enhanced CPC (`SMART`) / Fixed Bid | Target CPA | Maximize Conversions | Maximize Value |
|---|---|---|---|---|
| **Campaign-level Target CPA** (`cpa_goal`) | n/a | ✅ | n/a | n/a (uses `target_roas`) |
| **Campaign-level Target ROAS** (`target_roas`) | n/a | n/a | n/a | ✅ |
| **Campaign-level CPC bid** (`cpc`) | ✅ (`FIXED` only) | ❌ algo decides | ❌ algo decides | ❌ algo decides |
| **Campaign-level CPC cap** (`cpc_cap`) | ✅ | ✅ | ✅ (last-resort) | ✅ (last-resort) |
| **Campaign-level daily budget** (`spending_limit`) | ✅ | ✅ | ✅ | ✅ |
| **Publisher-level bid boost / de-boost** (`publisher_bid_modifier`) | ✅ | ❌ | ❌ | ❌ |
| **Publisher-level block / unblock / whitelist** (`publisher_targeting`) | ✅ | ✅ | ✅ | ✅ |
| **Item-level bid, priority, weight** | ❌ never | ❌ never | ❌ never | ❌ never |
| **Item-level pause / activate** (`is_active` on the item) | ✅ | ✅ | ✅ | ✅ |
| **Item-level create / edit** | ✅ | ✅ | ✅ | ✅ |
| **Day-parting** (`activity_schedule`) | ✅ | ✅ | ✅ | ✅ |

**Refuse and reframe** any payload that violates the matrix:

- `publisher_bid_modifier` on Maximize Conversions / Target CPA / Maximize Value → reframe as `publisher_targeting` block / whitelist.
- `cpc` on a non-`FIXED` campaign → reframe as `cpc_cap` (if a ceiling is the intent) or remove (the algorithm decides).
- `cpa_goal` on a non-`TARGET_CPA` campaign → reject; the field only takes effect on Target CPA.
- Any item-level bid / priority / weight field — these don't exist on Realize. Reframe as pause / activate / create / duplicate / edit.

## 5. Discovery + readback tools

### Discovery (resolve every value before any write)

| Tool | Returns | Used for |
|---|---|---|
| `search_accounts(query, page, page_size)` | Account list with opaque `account_id` strings | Resolve account first. `page_size` hard cap = 10. |
| `search_geos(dimension, query)` | Geo entities | Country / region / DMA / city / postal codes. Pick one dimension per call. |
| `search_audiences(account_id, query)` | Account-resident custom audiences | Pixel-built segments, CRM uploads, saved combined audiences. |
| `search_lookalike_audiences(account_id, query)` | Account-resident lookalike seeds | Pixel-based predictive, CRM lookalike, etc. |
| `search_contextual_segments(query)` | Network-wide marketplace catalogue | Demographics, interests, 3P data partner segments. NEVER expected empty for a US-targeted campaign. |
| `search_publishers(query)` | Publisher list | Allow / block list resolution. |
| `search_conversion_rules(account_id, query)` | Account conversion rules | Required for performance objectives. |
| `search_techno(dimension, query)` | Techno entities | OS / browser / connection types. |
| `list_cta_types()` | CTA enum values | Native item `cta.cta_type`. |
| `list_time_zones()` | Time zone enum values | Dayparting `activity_schedule.time_zone`. |

### Readback (after writes)

| Tool | Returns | Use after |
|---|---|---|
| `get_campaign(account_id, campaign_id)` | Full campaign object | Single-campaign readback after `create_campaign` or `update_campaign`. |
| `get_all_campaigns(account_id)` | All campaigns on the account | Account-level rollup after a batch create. |
| `get_campaign_items(account_id, campaign_id)` | All items on a campaign | After `create_*_item` / `update_*_item`. |
| `get_campaign_item(account_id, campaign_id, item_id)` | Single item | After a targeted item edit. |

## 6. Common payload patterns

### Maximize Conversions campaign with conversion rule

```
create_campaign(
  account_id=<id>,
  name="<name>",
  marketing_objective="ONLINE_PURCHASES",
  branding_text="<brand>",
  spending_limit_model="DAILY",
  spending_limit=<daily_cap_currency>,   # ≥ 10× CPA goal
  bid_strategy="MAX_CONVERSIONS",
  pricing_model="CPC",
  conversion_rules=[{"rule_id": "<resolved_rule_id>"}],
  country_targeting={"type": "INCLUDE", "value": ["US"]},
  is_active=False,
)
```

### Target CPA campaign

```
create_campaign(
  ...,
  bid_strategy="TARGET_CPA",
  cpa_goal=<currency>,          # within 10-20% of stable actual CPA (see knowledge/bidding.md)
  spending_limit=<≥ 10× cpa_goal>,
  is_active=False,
)
```

### Maximize Value campaign with target ROAS

```
create_campaign(
  ...,
  marketing_objective="ONLINE_PURCHASES",
  bid_strategy="MAX_VALUE",
  target_roas=<multiple>,        # e.g., 2.5 for 250% ROAS
  conversion_rules=[{...}],      # purchase event with value reporting
  is_active=False,
)
```

### Enhanced CPC (SMART) with per-publisher bid modifiers

```
create_campaign(
  ...,
  bid_strategy="SMART",
  cpc=<base_bid>,
  publisher_bid_modifier=[
    {"publisher_id": <id>, "modifier_pct": +20},
    {"publisher_id": <id>, "modifier_pct": -10},
  ],
  is_active=False,
)
```

### Fixed Bid VCPM Display campaign

```
create_campaign(
  ...,
  marketing_objective="BRAND_AWARENESS",
  bid_strategy="FIXED",
  pricing_model="VCPM",          # locks campaign as Display at create
  cpc=<per-1000-viewable-impression rate>,   # NOT a click bid on VCPM
  is_active=False,
)
# Then attach Display items only:
create_display_item(
  account_id=<id>, campaign_id=<id>,
  ad_tag="<allowlist-matching tag, first char '<'>",
  dimensions=[{"width": 300, "height": 250}],
  url="<lp_url>",
  creative_name="<name>",
  is_active=False,
)
```

### Pause a live campaign

```
update_campaign(
  account_id=<id>, campaign_id=<id>,
  is_active=False,
)
```

### Block a publisher mid-flight

Pre-step: run the historical-top-N publisher block guard in `knowledge/site-management.md`. If the publisher is top-N, require explicit user confirmation in the Step 4 batch block.

```
# Fetch current targeting first, then append the EXCLUDE
current = get_campaign(account_id=<id>, campaign_id=<id>)
new_block = current.publisher_targeting.value + [<publisher_id>]
update_campaign(
  account_id=<id>, campaign_id=<id>,
  publisher_targeting={"type": "EXCLUDE", "value": new_block},
)
```

## 7. Common failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| `400 Unsupported tag` from `create_display_item` | 3P tag has an HTML wrapper or doesn't match the allowlist | Strip everything before the matched element (no `<!DOCTYPE>`, no `<html>` / `<body>` / `<div>`). See `knowledge/creative.md` for the allowlist. |
| `create_campaign` rejected — "conversion rule required" | Performance objective without an attached rule | Either attach an existing rule (`search_conversion_rules`) or stage with a placeholder per `knowledge/bidding.md` "When the conversion rule isn't ready yet" recipe. |
| Item creation succeeds but item shows wrong campaign type in UI | Created a Native item on a campaign destined for Display (or vice versa) | Item locks campaign type irreversibly. Pause the wrong-type campaign and create a fresh one with the intended type. See `knowledge/creative.md` "If a Native campaign was created by mistake when Display was wanted". |
| `cpc` field accepted but ignored on Maximize Conversions / Target CPA / Maximize Value | The algorithm sets the bid on fully-automated strategies — `cpc` is silently dropped | Don't set `cpc` on these strategies. If a ceiling is needed, use `cpc_cap` (last-resort). |
| `update_campaign` rejected with "marketing objective cannot change" | Trying to switch objective on a live campaign | Create a new campaign instead. Objective is locked at create. |
| Server-side crawl returns wrong creative for a Native item | Supplied `url` differs from the canonical page, or the page is JS-rendered without server-side meta | Supply `title` + `description` + `thumbnail_url` explicitly rather than relying on crawl. |

## 8. Cross-references

| File | Purpose |
|---|---|
| `knowledge/bidding.md` | Bid strategy mechanics, Bid Levers matrix (canonical), Learning-Period Guard, KPI → objective mapping. |
| `knowledge/budget.md` | 10× CPA rule, pacing, scaling, depletion-miss investigation. |
| `knowledge/campaign-structure.md` | Native vs Display lock-in (two-path), platform/device splits, Campaign Groups, Realize+ context. |
| `knowledge/creative.md` | Native vs Display creative requirements, 3P JS-tag validator allowlist + recipe, Wilson-score ranking. |
| `knowledge/targeting.md` | Marketplace vs account-resident audiences, Tier-1 markets, 6-dimension narrow-targeting diagnostic, small-market caveat. |
| `knowledge/site-management.md` | Historical-top-N publisher block guard, block-attribution framework. |
| `knowledge/brand-safety.md` | DV / IAS pre-bid, topic exclusions. |
| `knowledge/tracking.md` | Taboola Pixel / S2S, conversion-event design, troubleshooting. |
| `knowledge/custom-rules.md` | SpendGuard + Custom Rules (UI-only today). |
| `knowledge/reach-estimation.md` | Pre-launch reach estimation via `mcp__realize-mcp__get_campaign_reach_estimate` — use before `create_campaign` to validate the planned targeting won't be too narrow to deliver. |
