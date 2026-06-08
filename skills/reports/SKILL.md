---
name: reports
description: Pull Realize performance reports (CSV) and interpret them. Covers top-content, breakdown, history, and site/day breakdown reports with sort, filter, and pagination rules. Runs 4 mandatory pre-checks (conversion-goal resolution, marketing-objective alignment, delivery-eligibility, learning-period guard) before any report tool, enforces a sum-reconciliation gate on aggregated numbers, and applies default exclusions (low-spend cut + running-status filter) with the exclusion stated in the scope footer.
allowed-tools: ["Read", "Bash", "AskUserQuestion"]
---

# Reports

Wraps the four Realize MCP report tools. Reports return **CSV**, not JSON — interpret the output in prose rather than dumping it back at the user.

## Prerequisites

- `account_id` resolved via the `accounts` skill.

## Tools this skill wraps

| Tool | Sort | Filters | Good for |
|---|---|---|---|
| `mcp__realize-mcp__get_top_campaign_content_report` | ✓ | — | "What content performed best?" |
| `mcp__realize-mcp__get_campaign_breakdown_report` | ✓ | ✓ | "Break down campaign X by <dimension>" |
| `mcp__realize-mcp__get_campaign_history_report` | — | — | "How did campaign X trend over time?" |
| `mcp__realize-mcp__get_campaign_site_day_breakdown_report` | ✓ | ✓ | "Which sites/days drove the results?" |

**Sort.** `sort_field` is one of `"clicks"`, `"spent"`, `"impressions"`. `sort_direction` is `"ASC"` or `"DESC"` (uppercase, default `"DESC"`).

**Filters.** Named `filters` (plural). The parameter is a **flat JSON object with string-only values** that is merged into the upstream API's query string as-is. Example: `{"campaign_status": "RUNNING", "region": "US"}`. There is no predefined filter schema — keys and values are forwarded verbatim to the Realize API, and unknown keys are passed through without error on the MCP side. Nested objects and arrays are not accepted.

**Dates.** `start_date` and `end_date` are required on every report tool. Format: `YYYY-MM-DD` (ISO date, no time component, no timezone).

## CSV output format

Every response starts with a report header and a **metadata line** prefixed with `📊`:

```
🏆 **<Report Name> CSV** - Account: <account_id> | Period: <start_date> to <end_date>

📊 Records: 250 | Total: 1500 | Page: 1 | Size: 250

<csv header row>
<csv data rows...>
```

Always cite `Total` in your summary so the user knows the query's scope. If the response includes a `⚠️ **TRUNCATED**` banner, surface it — the data you see is incomplete.

See `references/csv-examples.md` for concrete sample outputs and `references/report-fields.md` for what each report returns.

## Pagination rules

- **Defaults:** `page_size=20`, `page=1`.
- **Max `page_size`:** 100 (server raises `ToolInputError` if exceeded).
- **Keep `page_size` constant** across pages in a single query session — changing it mid-pagination causes duplicates or gaps.
- **Stop early for ranked lookups.** If `Total` is 5,000 and the user asked for "top 5 by spend", stop after page 1.
- **Aggregation queries are the exception** — sum / mean / share-of-total questions require the full row set. See the **Sum-reconciliation gate** section below for the mandatory paginate-all + reconcile rule.

## Response-size limits

- CSV output is capped at **25 KB of characters** per call; truncation happens at row boundaries (no partial rows).
- A hard cap of **1,000 rows per page** is also applied regardless of `page_size`.
- If you see `⚠️ **TRUNCATED**`: narrow the query (shorter date range, tighter `filters`, smaller `page_size`) and retry. Do not silently present truncated data as complete.

## Mandatory pre-checks (run silently before pulling any report)

Before calling any report tool, verify these four conditions. Skipping them produces correct-looking numbers that mislead the user.

| # | Pre-check | Action | Why |
|---|---|---|---|
| **P1** | **Conversion goal resolution** | Use `get_campaign` to read the campaign's `conversion_rules` / goal mapping. If a campaign-level goal is set, name the event explicitly in your answer. If none is set, the campaign is optimising toward the **account default** — surface this to the user; do NOT assume the KPI from spend volume. Account-level or multi-campaign queries: use account default. | Wrong KPI = wrong analysis. Common silent failure when an account has multiple conversion events. |
| **P2** | **Marketing-objective alignment** | Pull `marketing_objective` via `get_campaign`. If the user is asking about a KPI that doesn't align with the campaign's objective (e.g., conversions on a `BRAND_AWARENESS` campaign, ROAS on a `DRIVE_WEBSITE_TRAFFIC` campaign), call this out early in your answer — don't analyse against a KPI the campaign wasn't optimising for. | Asking "why is CPA high on a Brand Awareness campaign?" needs reframing before reporting. |
| **P3** | **Delivery-eligibility** | For any cross-period comparison (this week vs last week, etc.): verify the parent scope was actually serving in **both** compared windows. Pull `get_campaign_history_report` and check for zero-spend days inside either window. | Comparing a fully-paused week to a normally-running week and reporting "spend dropped 100%" is a credibility failure. |
| **P4** | **Learning-period guard** | If the campaign meets the Learning-Period guard from `knowledge/bidding.md` (created within last 7 calendar days AND fewer than 30 lifetime conversions on the goal AND not yet completed the bid-strategy learning window) — label the campaign as **"Learning period"** in the answer. Do NOT recommend bid / budget changes; do NOT use its metrics in cross-campaign math. **Same rule as the learning-period guard in `optimize-campaign`** — both skills inline the identical plain-language user message (see the block immediately after the pre-checks table). | Recommendations during learning reset the algorithm's progress (see `knowledge/bidding.md`). |

If P1 / P2 / P3 surface a problem, raise it at the top of the answer before any numbers. If P4 fires, lead with the "Learning period" label and message the user in plain language **before** any operator-facing terminology:

> "This campaign is in its learning phase — the first 7 days where Realize's algorithm is figuring out which audiences, sites, and times convert best for you. CPA often looks high during this period because the algorithm is testing. Making changes (pausing, adjusting budget, swapping creatives) during learning resets the timer and starts the process over. The recommended action is to **wait** until the campaign has had at least 7 days AND 30 conversions, then re-evaluate."

Then surface what the report does show (current trajectory, top sites, etc.) framed as observation rather than recommendation. Do NOT ship bid / budget / targeting optimisation recommendations on a Learning-period campaign.

## Typical flows

**"Top-spending content last week."**
```
get_top_campaign_content_report(
  account_id=...,
  start_date="YYYY-MM-DD",
  end_date="YYYY-MM-DD",
  sort_field="spent",
  sort_direction="DESC",
  page_size=20
)
```
Summarize the top 3–5 rows in prose, including absolute spend and share of total.

**"Why is CPC up on campaign X?"**
1. Call `get_campaign_history_report` with `account_id`, `start_date`, `end_date` for a window spanning before and after the change. History returns per-campaign time-series in one CSV; no sort, no filters — read campaign X's rows out of the combined result in post-processing.
2. Call `get_campaign_site_day_breakdown_report` with `account_id`, the same date range, and (if it works with the upstream API) `filters={"campaign_id": "<X>"}`. The MCP forwards `filters` verbatim to the Realize API, so unknown keys are silently ignored upstream — if filtering by `campaign_id` doesn't narrow the output, fall back to post-filtering the CSV.
3. Compare the recent period against the prior equivalent window. Report the delta and likely driver.

**"Break down my biggest campaign by site."**
1. Identify the biggest campaign (via `campaigns` skill or `get_top_campaign_content_report`).
2. Call `get_campaign_site_day_breakdown_report` with `account_id`, date range, `sort_field="spent"`, and `filters={"campaign_id": "<top>"}` if upstream accepts that key. Otherwise pull broadly and filter to the chosen `campaign_id` in post-processing.
3. Report top sites by spend, CTR, and CPC.

> **`filters` is a passthrough.** The MCP does not validate filter keys — it merges your `filters` dict directly into the upstream API's query string. If a key isn't recognized upstream, it's silently ignored (you won't get an error from the MCP). Always sanity-check whether a filtered call actually narrowed the result before trusting the scope.

## Sum-reconciliation gate (mandatory for any aggregated number)

Before quoting any aggregated metric (sum, mean, share-of-total, or any ranking that reports share-of-total alongside the ranks) sourced from a paginated report, run this gate. Page-1-only aggregation is a silent failure mode that understates long-tail breakdowns by 10% or more — the numbers look plausible but won't reconcile against the Realize UI. **This gate overrides the "stop early" guidance in Pagination rules above when the goal is aggregation; pure ranked lookups (no share-of-total) follow the stop-early rule.**

1. **Always read `Total` from the response header** (the `📊 Records: N | Total: T | Page: P | Size: S` line). If `Total > returned_rows`, paginate through ALL pages before aggregating. Stop only when `page * page_size >= Total`.
2. **Aggregate across the FULL row set**, never the first page only. Keep `page_size` constant across pages to avoid duplicates / gaps.
3. **Reconcile.** Sum `spent` across every fetched row, compare to `get_campaign.spent` (campaign-scoped queries) or the breakdown report's account-level total (account-scoped). If they diverge by more than **2%**, suspect a missing page (re-paginate), date-window mismatch (UTC vs campaign-local time zone — try ±1 day), or a filter that was silently ignored upstream (verify all returned rows have the expected `campaign_id`).
4. **Document the row count + reconciliation in the scope footer**, e.g. *"aggregated across 2,433 site-day rows; reconciled against €7,499.89 total spend (within 0.4%)."*

Full pagination + reconciliation discipline (with worked failure modes) lives in `knowledge/reporting-aggregation.md`. Mandatory read for any reporting / optimization question.

## Default exclusions

Apply these silently when ranking or aggregating site / item / publisher breakdowns:

- **Low-spend exclusion:** drop entities with **spend < $5 USD-equivalent** OR **spend < 1% of the analysis window's total**. Below either threshold the numbers are too noisy to support a recommendation. State the exclusion in the scope footer (e.g., *"excludes 47 sites under the $5 / 1% threshold"*).
- **Status filter default for breakdown reports:** running campaigns only (pass `filters={"campaign_status": "RUNNING"}`). If zero rows return, retry once with the status filter dropped entirely (pass `filters={}` or omit the field) and note the broadening in the response.

These exclusions are about removing noise; they are not about hiding spend. Always state what was excluded in the scope footer so the user can ask to widen if they want the long tail too.

## Interpretation guidelines

1. **Always translate relative dates.** "Last week" → explicit ISO dates in the call, and echo the date range back in your summary.
2. **Cite numbers, not adjectives.** "Top-performing" is meaningless without the spend/CTR figure next to it.
3. **Sanity-check totals.** If `Total: 0` came back, say so explicitly — don't make up narrative from an empty report.
4. **Flag missing sort support.** `get_campaign_history_report` accepts no sort/filter; if the user asked for "sorted history", explain that history returns API default order and offer to re-pull via the breakdown report instead.
5. **Stage data into a single internal table per question.** Don't make multiple MCP calls when one would do — pull once, slice in post-processing.
6. **Always end with a scope footer.** The scope footer is an italic line at the bottom of the answer summarising what was queried — date range, filters / `account_id`, attribution model, row count, and any exclusions applied (low-spend cut, running-status filter, sum-reconciliation gate result). The convention is defined in `os/guardrails.md` § Output structure; the pre-checks, sum-reconciliation gate, and default exclusions above all feed content into it.

*(Attribution + timeframe rules for CPA / CVR / Leads / ROAS are enforced globally by `os/guardrails.md` § "Metrics and attribution" — they apply to every report summary you produce.)*

## Gotchas

- **CSV, not JSON.** Report tools differ from campaign/account tools in response format.
- **Large reports** (`page_size=100` × many pages) are slow and risk truncation. Ask before paginating beyond the first 3 pages.
- **Silent filter passthrough.** `filters` dict keys are forwarded to the upstream API without MCP-side validation — an unrecognized key gets ignored silently, making the call look like it filtered when it didn't. Always verify `Total` matches the expected narrowed scope.
