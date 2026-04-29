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
| **Fixed Bid** | According to client requirements | According to client requirements |

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
| Pace Ahead feature | Use to accelerate spend if needed. |

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

Short-burst campaigns typically run **2-10 days** for promotions, launches, or time-bound offers where the advertiser needs to ensure full budget depletion.

### Best Practices for Maximum Delivery

| Practice | Why |
|---|---|
| **Use a lifetime budget** instead of daily | Setting a lifetime budget for the full campaign duration allows unspent budget from earlier days to roll over, increasing the likelihood of full budget utilisation by end of flight. |
| **Use Pace Ahead** | Accelerates spend for the specific campaign. |
| **Adopt competitive bidding for very short flights (≤10 days)** | Use Enhanced CPC with a competitive bid to improve auction competitiveness and accelerate spend. |
| **Keep targeting broad** | Narrow audiences limit delivery within short timeframes. Broader targeting gives the algorithm more opportunities to spend efficiently and quickly. |

### Short-Burst Decision Table

| Flight Duration | Strategy |
|---|---|
| 2-3 days | Lifetime budget + Pace Ahead + broad targeting. Very short — focus on spend delivery over optimisation. |
| 4-7 days | Enhanced CPC with competitive bid + lifetime budget + broad targeting. |
| 8-10 days | Maximize Conversions viable if audience is large and budget meets the 10× rule. Use lifetime budget. |

---

## Guardrails

- Never set daily budget below 10× target CPA for Maximize Conversions campaigns ($50 minimum if CPA < $5).
- Never increase budget by more than 20% at a time.
- Never make frequent budget changes (more often than every 2-3 days) — this destabilises the algorithm.
- Never reduce budget during the learning phase unless absolutely necessary.
- Always allow 2-3 days for recalibration after any budget change.
- Always use lifetime budget for short-burst campaigns (2-10 days).
- Always monitor the Campaign Pacing column in the Realize UI.

## Common Mistakes

1. **Budget below 10× CPA.** Algorithm can't optimise effectively. Increase budget or start smaller and scale.
2. **Frequent budget changes.** Resets learning, destabilises CPA. Max one change per 2-3 days.
3. **Reducing budget during learning.** Resets learning phase, slows optimisation, negatively impacts CPA / CPC. Allow 2-3 days to stabilise first, then moderate adjustment only.
4. **Daily budget for short-burst.** Unspent budget doesn't carry over. Use lifetime budget.
5. **Narrow targeting on short-burst.** Can't spend budget in time. Keep targeting broad.

## Pro Tips

- For Enhanced CPC campaigns, budget math is different: daily = 5× CPA goal, monthly = 150× CPA goal.
- The 10× rule is **per campaign** — if you have 3 campaigns in a group, total group budget should be 3× the 10× requirement.
- Budget-depletion issues with Maximize Conversions are almost never a bidding problem — the strategy is designed to spend the full budget. Check targeting, creatives, and supply first.
- For seasonal campaigns, plan the budget curve: ramp up 3-5 days before the event, peak during, scale down after.
- Pace Ahead is a powerful but underused feature for campaigns that need to accelerate delivery.
