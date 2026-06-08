# Reporting & Aggregation Discipline

> Read this before aggregating any MCP report. The failure mode it guards against: aggregating only the first page of a multi-page paginated report and silently understating spend on long-tail breakdowns by 10% or more — numbers look plausible but won't reconcile against the Realize UI.

## Why this file exists

Every Realize MCP report tool that returns multi-row CSV data is **paginated**. Aggregating the first page only is a silent failure mode: the numbers come back, look plausible, and the answer ships. The mismatch surfaces when the user reconciles against the Realize UI. By then the credibility hit is done.

This file codifies the discipline. Apply it to every report-based answer that quotes an aggregated number — terminal output, summaries, comparisons, anything.

---

## The core rule

**For any aggregated metric (sum / mean / ranking) sourced from an MCP report:**

1. Read the `Total` field from the response header (e.g. `Records: 100 | Total: 2433`).
2. If `Total > returned_rows`, paginate through all pages before aggregating. Never aggregate from page 1 alone.
3. After aggregation, run the **sum-reconciliation gate**: sum the per-row `spent` across all rows, compare against `get_campaign.spent` (or the breakdown report's total spend at the account level). If they diverge by more than **2%**, suspect a missing page and re-paginate.
4. Only after both checks pass, use the numbers in any answer.

The 2% tolerance covers reasonable rounding across many rows (cents truncation, in-flight UTC-vs-local date-boundary settling). Anything larger means missing data or a bad date window.

---

## Per-tool pagination guidance

### `get_campaign_site_day_breakdown_report`

- This is the highest-risk tool. A 14-day Display campaign with broad supply targeting easily exceeds 2,000 rows.
- Always paginate. Default `page_size=100` (the max). Stop when `page * page_size >= Total` from the first response.
- Site-level aggregation requires summing ALL day-rows per site_id, not just the first page.
- Sanity-check by summing the per-row `spent` across all returned rows and comparing to `get_campaign.spent` (campaign-scoped queries) or the account-level spend (account-scoped queries) for the same date range. Within 2% = OK; over 2% = re-run.

### `get_campaign_breakdown_report`

- Returns one row per campaign per day. For 30 days and 50 campaigns that is 1,500 rows.
- Same pagination rule.

### `get_top_campaign_content_report`

- Most calls return 20 rows total — usually no pagination required. But verify `Total` in the response header anyway.
- If `Total > returned_rows`, paginate. Don't assume the default 20-row page covers everything.

### `get_campaign_history_report`

- Time-series style; row count = (number_of_days × number_of_metrics_columns) but typically fits in one page for a single campaign over 30-90 days. Still verify `Total`.

### Discovery tools (`search_accounts`, `search_audiences`, `search_publishers`, `search_contextual_segments`, etc.)

- Pagination matters less because the typical question is "find the account / segment / publisher matching this name" — a few results are enough. But if you're enumerating the universe (e.g. "list every contextual segment available for US") you must paginate.

---

## The pagination loop

Call the tool with `page=1, page_size=100`, read `Total` from the response header, then call again with `page=2, 3, ...` until you have all rows. Aggregate across the full set. Never aggregate before all pages are fetched, and never assume the first page covers the universe.

---

## The sum-reconciliation gate (mandatory)

After paginating and aggregating, before quoting any per-site or per-day number to the user:

```
sum_rows_spent  = sum of `spent` across every fetched row
expected_spent  = get_campaign.spent  (or the breakdown report's total spend at the account level)
diff_pct        = |sum_rows_spent - expected_spent| / expected_spent

if diff_pct > 2%:
    Do NOT ship the aggregated number.
    Re-paginate, widen the date window by 1 day, or check whether the
    filter parameter (e.g. campaign_id) was honored server-side.
```

Common causes of failure:
- Missing pages (the page-1-only aggregation failure mode).
- Date-window boundary mismatch between the report (UTC) and `get_campaign.spent` (the campaign's local time zone). Adjust the date range by 1 day if the gap is small and consistent.
- The report tool's filter parameter was ignored server-side (e.g. `campaign_id` filter not applied). Verify by checking all returned rows have the expected `campaign_id`.
- An item that ran during the period was deleted before the report was pulled.

---

## What this rule prevents

| Failure mode | Example | What this rule does |
|---|---|---|
| Page-1-only aggregation | Aggregated 97 of 2,433 rows; top-site spend reported as €231.61 vs. actual €256.06, ~10% understated. | Forces full pagination by reading `Total` header. |
| Silent partial-data ship | No error or warning surfaced — the numbers looked plausible. | Sum-reconciliation gate against `get_campaign.spent` catches the gap before ship. |
| Ranking shifts | Relative CTR ranking was directionally correct, but absolute spend / CTR per site was wrong. A different campaign could see ranking shift entirely if mid-page sites had different distributions. | Full data means rankings are stable. |
| Reconciliation mismatch with the Realize UI | The user reconciles against the UI and finds the mismatch. Credibility cost. | Numbers match UI within 2%. |

---

## Application checklist (silent, before answering any report-based question)

- [ ] Identified the MCP report tool that best matches the user's intent.
- [ ] Called the tool with `page=1, page_size=100`.
- [ ] Read `Total` from the response header.
- [ ] If `Total > 100`, called the tool again with `page=2, 3, ...` until all rows are fetched.
- [ ] Aggregated across the FULL row set, not the first page only.
- [ ] Ran the sum-reconciliation gate against `get_campaign.spent` (or breakdown total). Within 2%.
- [ ] Documented the row count in the scope footer (e.g. *"aggregated across 2,433 site-day rows; reconciled against €7,499.89 total spend (within 0.4%)"*).

If any check fails, fix and re-run. Never ship aggregated numbers from a partial sample.
