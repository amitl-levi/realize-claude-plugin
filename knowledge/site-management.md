# Site Management

## Overview

Site management controls which publisher sites receive campaign spend. Effective management balances performance optimisation (blocking bad sites) against reach (maintaining enough inventory). This file covers site targeting, performance monitoring, blocking decisions, approved lists, and cross-cutting CPA / CVR issues.

---

## Site Performance Monitoring

### How to Monitor

Periodically review the **site performance report** in the "Site" section of the Realize UI.

### Sites to Consider Excluding

Consider excluding sites that:

- Generate **fewer clicks against spend**.
- Have **clicks but little or no conversions** against spend.
- Have **significantly higher CPAs** than campaign averages.

### Data Thresholds for Site Decisions

Only take exclusion decisions when sufficient data exists.

1. **Campaign level:** Campaign Clicks ≥ 500 and Campaign Conversions ≥ 5 (ensures campaign CVR is relatively stable).
2. **Site level:** either of the following:
   - Site Clicks ≥ 100, or
   - Site Clicks ≥ 2 ÷ Campaign_average_CVR (the number of clicks that would have generated 2 conversions under the campaign's average CVR).

---

## Scaling: Site Targeting

### When to Use Site Targeting / Approved Lists

Site targeting is suitable for advertisers with significant learnings from past or always-on campaigns.

| Use Case | Details |
|---|---|
| **Short-burst / seasonal campaigns** | Maximise impact and performance by running on known top performers. |
| **Curated premium publishers** | Target specific supply (e.g., Yahoo placements only). |

### Scaling via Site Exclusions

| Lever | When | Guidance | Monitor |
|---|---|---|---|
| **Excluding sites** | Spend going to sites not contributing conversions or with high CPC / CPA | Monitor site performance, exclude **10-20 underperforming sites**. | CVR. Continue monitoring post-exclusion. |

---

## Concentrated Site Spend

### When Spend Is Focused on a Few Sites

If campaign spend is concentrated on a few sites, limiting algorithmic learning and opportunities to scale:

| Action | How |
|---|---|
| **Create a campaign excluding those sites** | Allows the algorithm to redistribute budget toward under-utilised sites and uncover new performance pockets. |
| **Adjust budget settings** | If budget is too narrow or capped, the algorithm may continue favouring a handful of placements. Increasing or redistributing budget opens opportunities for exploration. |
| **Cross-check with auction insights** | Review auction data — check whether delivery is constrained by low bid competitiveness or site-level restrictions. Check auction activity for specific publisher sites. |

---

## Cross-Cutting: Sites + CPA / CVR Issues

### When Both CPA and CVR Are Underperforming

| Step | Action |
|---|---|
| 1 | **Cross-check with auction insights.** Identify campaign blockers using the auction report — check whether the campaign is competitive enough or facing blockers needing corrective action. |
| 2 | **Budget adjustments.** Ensure CPA goals are realistic. Consider increasing budget to allow the algorithm to explore more conversion opportunities. |
| 3 | **Check site report.** Identify underperforming sites to manually block, or set up Custom Rules to automate and avoid wasted spend. |
| 4 | **Review and refresh messaging.** Check creative performance, pause underperforming ads. Double down on what works by using Gen AI AdMaker to create variations of top performers. |

### CPA / ROAS High-Level Framework

When the account's average CPA is higher than the goal:

1. **Remember the average consists of outlier segments.** A segment can be a campaign, an ad, a site, a platform / OS, or even hours of the day. Identify the worst segments driving CPA up and consider excluding them.
2. **Don't be hasty with optimisations.** Only optimise when there is enough data. Use longer lookback windows. There is no magic number for sufficient data.
3. **Leverage tools for site optimisations.** SpendGuard (fully automated), Custom Rules (semi-automated), or conditional filters (manual) to identify outliers.
4. **Tap into additional supply or users** — Mail, predictive audiences, retargeting campaigns.
5. **Refresh creatives** — especially for narrow-targeted campaigns which suffer more from fatigue. Refresh must be significant (new angles, not a word change).
6. **Is there enough data?** Consider adding a secondary event if only optimising for primary and conversion volume is low.
7. **Scale top performers.** If you identify campaigns at or below CPA goal, scale them gradually. More conversions at good CPA = overall CPA decreases.

---

## Display Campaign Site Management

Special rules for display campaigns:

- **Do not block channel publishers** — these indicate sites with header-bidding supply.
- **Do not block publishers based on Sponsored Content campaign performance** or past experiences — Sponsored Content and Display have different dynamics.

---

## Guardrails

- Never exclude sites without meeting data thresholds (Campaign: 500 clicks + 5 conversions; Site: 100 clicks or 2 / CVR).
- Never block publishers during the learning phase (first 7-10 days).
- Never block channel publishers in display campaigns (header-bidding supply).
- Never block display publishers based on Sponsored Content performance.
- Never be hasty with optimisations — require sufficient data over longer lookback windows.
- Always check auction insights when diagnosing site performance issues.
- Always review site performance periodically in the Realize UI.
- Always consider creating an excluding campaign (vs. blocking sites) to test redistribution.

## Common Mistakes

1. **Blocking during learning phase.** Removes publisher exploration. Wait 7-10 days.
2. **Insufficient data for blocking.** Blocks potentially good sites. Follow data thresholds.
3. **Blocking display publishers based on Sponsored Content data.** Different dynamics. Evaluate each campaign type independently.
4. **Blocking channel publishers.** Removes header-bidding supply. Never block these in display.
5. **Only blocking, never redistributing.** Doesn't find new pockets. Try the excluding-campaign approach.
6. **Not using auction insights.** Missing context on bid competitiveness and blockers. Always check auction insights.

## Pro Tips

- Instead of just blocking underperforming sites, try creating a **parallel campaign excluding those sites**. This lets the algorithm find new performance pockets while keeping the original campaign running.
- **Auction insights** are underused. They tell you whether delivery is constrained by bid competitiveness or site restrictions — critical context before taking action.
- Exclude **10-20 underperforming sites** at a time, not 50+. Aggressive blocking limits the algorithm's ability to find conversions.
- Continue monitoring site performance **after** exclusions — the remaining sites' dynamics change once top spenders are removed.
- For concentrated-spend issues, increasing budget can sometimes be more effective than blocking — it gives the algorithm room to explore beyond the current top sites.
