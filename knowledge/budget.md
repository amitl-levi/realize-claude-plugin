# Budget

## Overview

Managing budgets effectively sustains performance while minimising waste. Start with a modest daily budget relative to campaign goals and scale gradually as performance stabilises — this gives the algorithm time to learn and optimise. This file covers the 10× CPA rule, pacing, scaling, and short-burst campaign handling.

> **Attribution note:** When comparing budget outcomes against CPA goals, always state the attribution model used (`CPA (CT only)`, etc.).

---

## Budget Planning

### The 10× CPA Rule

For campaigns using **Maximize Conversions**, the daily budget must be:

| CPA Level | Daily Budget Requirement |
|---|---|
| CPA ≥ $5 | **10× target CPA per campaign** (e.g., $500 for a $50 CPA goal) |
| CPA < $5 | **$50 minimum** daily budget |

If 10× isn't feasible upfront, start smaller and increase once enough data is collected to evaluate trends.

### Budget by Bidding Strategy

| Strategy | Daily Budget | Monthly Budget |
|---|---|---|
| **Maximize Conversions** | 10× expected CPA (or $50 min) | — |
| **Enhanced CPC** | 5× CPA goal | 150× CPA goal |
| **Fixed Bid** | According to advertiser requirements | According to advertiser requirements |

---

## Budget Pacing

### How Pacing Works

The algorithm distributes the daily budget across the day to maximise performance.

| Pacing Behaviour | What It Means | Action |
|---|---|---|
| Even pacing throughout day | Normal — algorithm distributing optimally | None. |
| Spent full budget early | Budget may be too low for targeting size | Consider increasing. |
| Below 80-90% depletion | Campaign constrained | Diagnose: targeting, bids, creatives, publisher blocks. |
| Spending $0 | Campaign blocked | Check status, approvals, targeting, creatives. |

### Underspending Diagnostic

| Check | Action |
|---|---|
| Campaign status | Ensure active and not paused. |
| Creative approval | Verify all creatives approved and active. |
| Audience targeting | Too restrictive — broaden. |
| Bidding (Enhanced CPC / Fixed) | Slightly increase bids to stay competitive. |
| Bidding (Maximize Conversions) | Increase daily spend by up to 20%. |
| Pace Ahead feature (UI-only — not exposed via the Realize MCP) | Use to accelerate spend if needed; set in the Realize UI. |

### Depletion-Miss Investigation (when the campaign did not hit its cap)

When a campaign should have spent its daily cap but didn't, "underspending" doesn't tell the full story. Use this systematic checklist:

1. **Reconstruct the end-of-day cap, not the current cap.** The current value of the daily cap on the campaign may have been reset post-period. To answer "did the cap match what was scheduled?", reconstruct the cap from the campaign change log at the close of the analyzed day. The current snapshot value is misleading for historical depletion math.
2. **Per-campaign depletion %** — for the day in question, compute `actual_spend / end_of_day_cap`. Anything below ~85% with no explanation is a depletion miss worth investigating.
3. **Publisher / supply mix shifts** — compare top-publisher spend share for the analyzed day vs. the previous comparable day. A sharp drop in a usually-large supplier is the most common driver.
4. **Custom-rule fires** — was a SpendGuard or Custom Rule action applied during the day that took supply offline?
5. **Self-inflicted blocks** — was a publisher block applied earlier in the day? Cross-check against the historical-top-N publisher list (see `site-management.md`).
6. **Bid + budget timeline** — reconstruct every bid / budget change through the day with the user who made it named (from the change log). Repeated edits within a few hours often signal panic actions.

### Pro Tip

Keep an eye on the **Campaign Pacing column** in the performance report section of the Realize UI to ensure healthy pacing and budget alignment.

---

## Scaling Budget

### When to Scale

- Budget depletion is OK and CPA / CPC is acceptable.
- Seasonality adjustments needed to stay competitive.

### How to Scale

| Strategy | Action | Guardrail |
|---|---|---|
| **Maximize Conversions** | Increase daily spend by **up to 20%** | Allow the algorithm room to look for additional opportunities. |
| **Enhanced CPC or Fixed Bid** | Apply a **bid boost** | Only when the campaign shows stable performance **and** budget pacing is below 80-90%. |

### Scaling Rules

- Consider increments of **up to 20% at a time**.
- **Allow the campaign time to recalibrate** before making further changes.
- Monitor CPA / CPC / ROAS and campaign pacing when adjusting.
- Factor seasonality — adjust budgets to stay competitive during peak periods.

### Pro Tip

Consider using the **Performance Simulator** (if eligible) to identify potential adjustments for enhanced performance.

---

## Short-Burst Campaigns

### Definition

Short-burst campaigns typically run **2-10 days** for promotions, launches, or time-bound offers where full budget depletion within the window is the goal. Within that range, the **bid strategy splits at 7 days** — see the decision table below.

### Best Practices for Maximum Delivery

| Practice | Why |
|---|---|
| **Use a lifetime budget** instead of daily | Setting a lifetime budget for the full campaign duration allows unspent budget from earlier days to roll over, increasing the likelihood of full budget utilisation by end of flight. |
| **Use Pace Ahead** (UI-only — not exposed via the Realize MCP) | Accelerates spend for the specific campaign; set in the Realize UI. |
| **Adopt competitive bidding for very short flights (≤7 days)** | Use Enhanced CPC with a competitive bid to improve auction competitiveness and accelerate spend. |
| **Use Maximize Conversions for longer flights (> 7 days)** | Lets the algorithm leverage MaC learning and historical data to drive best performance. |
| **Keep targeting broad** | Narrow audiences limit delivery within short timeframes. Broader targeting gives the algorithm more opportunities to spend efficiently and quickly. |

### Short-Burst Decision Table

| Flight Duration | Strategy |
|---|---|
| 2-3 days | Lifetime budget + Pace Ahead + broad targeting. Very short — focus on spend delivery over optimisation. (Pace Ahead is UI-only — set in the Realize UI; the plugin cannot adjust it via MCP.) |
| 4-7 days | Enhanced CPC with competitive bid + lifetime budget + broad targeting. |
| > 7 days | Maximize Conversions if audience is large and budget meets the 10× rule. Use lifetime budget. Allows MaC learning to compound over the flight. |

---

## Cross-Period Budget Comparisons — % Share, Not Absolute $

When comparing publisher mix, supply share, channel split, or any per-entity slice across two or more periods where the **total budget / spend differs**, compare in **% share of total period spend**, not absolute dollars.

- **Primary number:** % share of total period spend.
- **Secondary number:** absolute $ alongside the % share.
- **Δ row:** in **percentage points (pp)**, not relative %. "Apple News dropped from 22% → 14% (Δ −8 pp)" — never "Apple News dropped 36%."

If period A has $20k total spend and period B has $30k total spend, an absolute "$4,400 → $4,200" looks stable but the share moved 22% → 14% (Δ −8 pp). Use the share view as the headline; the absolute view as context.

This rule applies to budget post-mortems, A / B tests with different arm budgets, geo / device / channel splits across windows of different totals, and any forecasting analysis that compares cohorts of different sizes. The few cases where absolute $ leads: pure YoY "did we grow" framings, single-entity time-series tracking, and forward-looking budget planning.

---

## Guardrails

- Never set daily budget below 10× target CPA for Maximize Conversions campaigns ($50 minimum if CPA < $5).
- Never increase budget by more than 20% at a time.
- Never make frequent budget changes (more often than every 2-3 days) — this destabilises the algorithm.
- Never reduce budget during the learning phase unless absolutely necessary.
- Never use the current `daily_spending_limit` for historical depletion math — reconstruct the end-of-day cap from the change log.
- Never compare absolute $ across periods with different total budgets — % share primary, absolute secondary, Δ in pp.
- Always allow 2-3 days for recalibration after any budget change.
- Always use lifetime budget for short-burst campaigns (2-10 days).
- Always monitor the Campaign Pacing column in the Realize UI.

## Common Mistakes

1. **Budget below 10× CPA.** Algorithm can't optimise effectively. Increase budget or start smaller and scale.
2. **Frequent budget changes.** Resets learning, destabilises CPA. Max one change per 2-3 days.
3. **Reducing budget during learning.** Resets learning phase, slows optimisation, negatively impacts CPA / CPC. Allow 2-3 days to stabilise first, then moderate adjustment only.
4. **Daily budget for short-burst.** Unspent budget doesn't carry over. Use lifetime budget.
5. **Narrow targeting on short-burst.** Can't spend budget in time. Keep targeting broad.
6. **Using current daily-cap value for historical depletion math.** Caps are often reset post-period. Reconstruct end-of-day cap from the change log.
7. **Comparing absolute $ across periods with different totals.** Hides the real story. Use % share + Δ pp.

## Pro Tips

- For Enhanced CPC campaigns, budget math is different: daily = 5× CPA goal, monthly = 150× CPA goal.
- The 10× rule is **per campaign** — if you have 3 campaigns in a group, total group budget should be 3× the 10× requirement.
- Budget-depletion issues with Maximize Conversions are almost never a bidding problem — the strategy is designed to spend the full budget. Check targeting, creatives, and supply first.
- For seasonal campaigns, plan the budget curve: ramp up 3-5 days before the event, peak during, scale down after.
- Pace Ahead is a powerful but underused feature for campaigns that need to accelerate delivery. **Note:** Pace Ahead is **not exposed via the Realize MCP** — it is a UI-only acceleration feature, set in the Realize UI after campaign creation. The plugin cannot enable or adjust Pace Ahead through `create_campaign` / `update_campaign`; if a user asks the plugin to enable it, refuse the write and route them to the Realize UI.
