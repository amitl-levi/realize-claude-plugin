# Bidding

## Overview

Bidding strategy determines how the Realize algorithm spends the advertiser's budget to achieve conversions. The right strategy depends on campaign maturity, data volume, and optimisation goals. This file covers strategy selection, learning phase behaviour, CPA troubleshooting, and scaling.

> **Attribution note:** CPA, CVR, and conversion metrics in this file refer to the advertiser's selected attribution model in Realize. When reporting these metrics in analysis, always specify the model — `CPA (CT only)`, `CPA (Total CT+VT)`, or equivalent.

---

## Strategy Selection

The primary recommendation is **Maximize Conversions** for best performance. Other strategies exist for specific scenarios.

### Strategy Decision Table

| Strategy | Automation | Budget Requirement | Baseline Bid | First Days Expectation |
|---|---|---|---|---|
| **Maximize Conversions** | Fully automated | Daily: 10× expected CPA goal. $50 minimum if CPA is under $5. | N/A (auto) | First 2-4 days: CPA fluctuations. Then CPA decreases and stabilises, conversion volume increases. **Strongly recommended not to adjust the campaign during this window.** |
| **Maximize Conversions + Target CPA** | Fully automated | Daily: 10× expected CPA goal. $50 minimum if CPA is under $5. | Set Target CPA with a realistic goal | Target CPA can reduce campaign scale if the target is far from actual performance. **Apply only as a last resort when performance is so poor the campaign is at risk of being paused.** |
| **Enhanced CPC** | Semi-automated | Daily: 5× CPA goal. Monthly: 150× CPA goal. | Known CVR: CPC = CPA goal × CVR. Unknown CVR: similar segment average CPC. | Learning phase ~11 days. Performance less stable, fluctuations in CTR and CPA during adjustment. |
| **Fixed Bid** | Manual | According to client requirements | According to client requirements | N/A |

### Strategy Selection Rules

1. **Default: Maximize Conversions** — the right choice for fully automated bidding.
2. **Add Target CPA only** if CPA cost control is more important than conversion volume. Target CPA is by design more conservative and prioritises cost over scale.
3. **Use Enhanced CPC** when the advertiser wants more control over CPC. Enhanced CPC uses the advertiser's base CPC as the bidding benchmark.
4. **Use Fixed Bid** only when complete bid control is required — focusing on impressions, bidding on vCPM / CPM, or when not tracking conversions.

### Critical Target CPA Rules

- **Never set Target CPA immediately at campaign launch.** Allow the campaign to gather performance data for the first 3-4 days. Once CPA has stabilised, use that data as the benchmark.
- Setting Target CPA too early can significantly prolong the learning phase and delay stabilisation.
- Once Target CPA is set, allow the algorithm to optimise. The full budget may not deplete due to the CPA constraint.

### When to Switch Strategies

| Current State | Signal | Action |
|---|---|---|
| Maximize Conversions, CPA too high | CPA consistently above goal after learning phase | Add Target CPA — set at or near current actual CPA, not an aspirational target. Expect a scale drop if the target is lower than existing performance. Check average CPA from past weeks using post-click performance only. |
| Maximize Conversions, scale is low | Budget not depleting | Use auction insights to investigate. Consider expanding targeting and refreshing ads. Raise budget, broaden targeting. |
| Maximize Conversions, high CTR low CVR | Good clicks but no conversions | Reassess landing-page quality, check creative relevance, adjust targeting. |
| Maximize Conversions, high CVR low scale | Converting well but not enough volume | Raise bid, expand targeting, consider splitting out top placements. |
| Maximize Conversions, steady scale but high CPA | Spending but CPA above goal | Add predictive or CRM audience layering, refresh creative, refine site list. |
| Any strategy, stalled scale post-launch | Campaign not growing | Wait the full 7-10 day learning phase. Review targeting or bid constraints. Use auction insights. |
| Enhanced CPC, performance acceptable | Stable and competitive | Consider gradually shifting to Maximize Conversions for more automation. |

### Bid Ceiling for Maximize Conversions

Apply a bid ceiling only if CPA efficiency is critical **and** scale is strong. Availability is limited to select advertiser types.

---

## Learning Phase

### What Happens During Learning

The first 2-4 days show CPA fluctuations. As learning progresses, CPA stabilises and conversion volume increases.

**Critical: strongly recommended not to adjust the campaign during the learning phase.**

### Learning Phase Duration

Allow **7 to 10 days** for a campaign to exit learning. Avoid any major changes in this stage.

### Overspending During Learning

If the campaign is pacing ahead of expectation:

1. Allow the campaign **2-3 days to stabilise**.
2. During learning, the algorithm is trying to optimise for the selected conversion event and get enough data to finish learning faster.
3. **Reducing budget too early can reset the learning phase, slow optimisation, and negatively affect CPA and CPC.**
4. Only intervene if the advertiser has strict budget restrictions — and even then, prefer a moderate adjustment over a significant reduction.

### Underspending During Learning

| Check | Action |
|---|---|
| Conversion tracking | Ensure the conversion event is implemented and firing correctly. |
| Creative approval | Verify all creatives are approved and active. |
| Audience targeting | Check whether targeting is too restrictive. |
| Bidding (Enhanced CPC / Fixed) | Consider slightly increasing bids to stay competitive in auctions. |
| Bidding (Maximize Conversions) | Consider increasing daily spend by up to 20% of existing spend. |
| Pace Ahead feature | Use to accelerate spend for a specific campaign if needed. |

For display campaigns specifically, also check:

- Upload recommended creative sizes (Mobile: 300×250, 300×600, 320×50, 720×1280; Desktop: 300×250, 300×600, 970×250, 728×90, 160×600).
- Do not block channel publishers (these are sites with header-bidding supply).
- Do not block publishers based on Sponsored Content campaign performance or past experiences.
- Use Maximize Conversions as the bidding strategy.

### Extended Learning Phase

If the learning phase extends beyond 14 days:

| Check | Action |
|---|---|
| Conversion volume | For lower-funnel goals (e.g., purchases), consider adding earlier-funnel conversion events to help the algorithm collect enough data. |
| Audience targeting | If the audience is too narrow, expand targeting or add new segments. Use the Reach Estimator to validate sufficient scale. |
| Creative performance | Use auction insights to identify campaign diversity or other blockers restricting delivery. |
| Bid / spend (Enhanced CPC) | Consider adjusting the bid to allow more flexibility during optimisation. |
| Bid / spend (Maximize Conversions) | Consider increasing the budget by up to 20% of existing spend so the algorithm can explore additional opportunities. |

---

## Post-Launch CPA Volatility

CPA volatility immediately after launch is common — the algorithm is learning and optimising. **Allow 2-3 days for CPA to stabilise.**

### If a CPA Spike Persists

| Step | Action |
|---|---|
| 1 | **Review spend vs. CPA alignment.** Check whether daily spend is sufficient and the CPA goal is realistic. |
| 2 | **Consider adding Target CPA.** On Maximize Conversions, adding Target CPA controls cost. Be mindful this can reduce daily spend — set client expectations. |
| 3 | *(Optional)* **Bid ceiling.** For advertisers with strict CPC goals, consider a bid ceiling to cap CPC. |

### CPA Spike Signal Table

> All CPA / CVR numbers below assume the advertiser's selected attribution model — state it explicitly in any answer that uses these patterns.

| Signal | Suggested Actions |
|---|---|
| High CTR, Low CVR | Reassess landing-page quality, check creative relevance, adjust targeting. |
| High CVR, Low Scale | Raise bid, expand targeting, move to Maximize Conversions (if not already), consider splitting out top placements. |
| Steady scale, High CPA | Add predictive or CRM audience layering, refresh creative, refine site list. |
| Stalled scale post-launch | Wait the full 7-10 day learning phase. Review targeting or bid constraints. Use auction insights. |
| Maximize Conversions active, CPA too high | Add Target CPA — expect a scale drop if the target is lower than existing performance. Check average CPA from past weeks (post-click only). Consider blocking underperforming sites using Custom Rules. |
| Maximize Conversions active, scale is low | Use auction insights. Consider expanding targeting and refreshing ads. Raise budget, broaden targeting. |

---

## Troubleshooting: Fluctuating CPA

Route by bidding strategy.

### Maximize Conversions

1. Ensure you are not making frequent changes (especially to budget). If adjusting budget, use increments / decrements of up to **20% at a time** and allow **2-3 days** for recalibration.
2. Make sure **SpendGuard is not disabled**, and that Custom Rules are aligned with real KPIs to protect against underperforming sites or ads.
3. If no Custom Rules exist, **manually review the site report** and block underperforming sites. Also manually review the ad report, pause underperforming ads, and add new ads.
4. **Review ads** — look for high-CTR / high-spend ads with post-click underperformance. Check whether messaging is misleading or over-promising.

### Enhanced CPC or Fixed Bid

1. Review and **adjust bids** — bids may be restricting campaign performance and causing CPA fluctuation.
2. Review **auction insights** to understand whether delivery is constrained by low bid competitiveness or site-level restrictions.

### All Strategies

- **Revisit audience targeting.** Restrictive targeting leads to fluctuations. Consider adding segments to broaden the audience.
- **Evaluate external factors.** Seasonality, market trends, or competitive activity can affect CPA.

---

## Troubleshooting: High CPA

High CPA indicates inefficiency. Check in this order.

| # | Check | Action |
|---|---|---|
| 1 | **Conversion event** | Ensure the event has enough data or the campaign is able to finish learning and gather enough conversion data. If the conversion event is extremely rare, higher CPA is expected — adjust client expectations and start with a larger budget, or add earlier-funnel conversion events. |
| 2 | **Budget** | Restrictive budget limits the algorithm's ability to spend and leads to higher CPA. Consider increasing the budget to stay competitive. |
| 3 | **Audience focus** | Going too broad can result in wasted spend and higher CPAs. Focus on high-intent audiences using mail and search signals, or narrow to top-performing demographic segments. (Too narrow can also impact scale.) |
| 4 | **Creative and landing-page alignment** | A mismatch between creative messaging and landing page leads to higher CPAs. Ensure landing-page messaging aligns with creative messaging. Ensure the ad is not over-promising or misleading. |

---

## Scaling: Adjusting Bids

### Maximize Conversions

Increase daily spend by **up to 20%**, allowing the algorithm room to look for additional opportunities.

### Enhanced CPC or Fixed Bid

Apply a **bid boost** when the campaign shows stable performance and **budget pacing is below 80-90%**.

### Pro Tip

Consider using the **Performance Simulator** (if eligible) to identify potential adjustments for enhanced performance.

---

## Guardrails

- Never set Target CPA immediately at campaign launch — wait 3-4 days for data.
- Never set Target CPA far from actual performance — it can significantly decrease scale.
- Never make frequent campaign changes during the learning phase — this resets learning and worsens performance.
- Never reduce budget aggressively during learning — moderate adjustments only, and only if absolutely necessary.
- Never judge CPA performance in the first 2-4 days — this is normal learning volatility.
- Never adjust budget by more than 20% at a time.
- Always allow 2-3 days for recalibration after any budget change.
- Always use Maximize Conversions as the default bidding strategy.
- Always allow 7-10 days for the learning phase before evaluating.
- Always check post-click CPA performance (not just last-click) when setting Target CPA benchmarks.

## Common Mistakes

1. **Setting Target CPA too early.** Prolongs learning phase, delays stabilisation. Wait 3-4 days for data first.
2. **Setting an aspirational Target CPA.** Algorithm cannot hit an unrealistic target, scale drops. Set at or near actual current CPA.
3. **Frequent budget changes during learning.** Resets learning each time. Make one change, wait 2-3 days.
4. **Reducing budget to fix high CPA.** Limits the algorithm's ability to optimise. Address root cause (tracking, creatives, targeting) instead.
5. **Blocking publishers based on Sponsored Content performance in display campaigns.** Sponsored Content and Display have different dynamics — evaluate each campaign type independently.
6. **Using Fixed Bid for conversion campaigns.** No conversion optimisation. Use Maximize Conversions unless there is a specific reason not to.

## Pro Tips

- Maximize Conversions without Target CPA is designed to spend the full daily budget. If it is not spending, the problem is targeting, creatives, or supply — not the bid strategy.
- SpendGuard is on by default. It is a predictive model that automatically identifies underperforming sites and caps or blocks them. It does not require action unless you want to disable it.
- Enhanced CPC base-bid formula when CVR is known: `CPC = CPA goal × CVR`. When CVR is unknown, use similar-segment average CPC.
- For Enhanced CPC: daily budget should be 5× CPA goal, monthly budget should be 150× CPA goal.
- When CPA spikes persist after learning, check average CPA from past weeks looking at **post-click performance only** before setting a Target CPA.
- The Pace Ahead feature can accelerate spend for a specific campaign when delivery is slow.
