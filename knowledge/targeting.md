# Targeting

## Overview

Targeting determines who sees the campaign. The right targeting strategy balances reach (enough volume for the algorithm to optimise) against precision (showing ads to likely converters). This file covers audience strategy by objective, all available targeting solutions, expansion, retargeting, and predictive audiences.

> **Attribution note:** When reporting CPA, CVR, or any conversion metric tied to a targeting segment, always name the attribution model explicitly (e.g., `CPA (CT only)`).

---

## Audience Strategy by Objective

### Strategy by Campaign Objective

| Objective | Strategy | Details |
|---|---|---|
| **Engagement / Brand Awareness Campaigns** | Start broad → narrow after identifying best audiences | Recommended: contextual / interest targeting. |
| **Maximising Efficiency (Low CPA / ROAS)** | Start with high-intent audiences | Start with Search Retargeting (SRT — active intent) and Mail Retargeting (MRT — transaction signals, competitor conquesting). Add Pixel or CRM Retargeting after a few days to optimise on first-party data. |
| **Scale with Performance** | Start with MRT bundles or Contextual | MRT bundles (categories fitting the advertiser's vertical) or Contextual Targeting (Interests) to fuel the algorithm. Add Predictive Audiences when using a pixel seed. US accounts can also use CRM Lookalike. |
| **Niche / Persona Accuracy** | Prioritise declared first-party demographics | Use declared over inferred data for zero wastage. Avoid relying solely on third-party segments unless first-party scale is insufficient. |

### All Available Targeting Solutions

| Audience Type | Best Practices |
|---|---|
| **Taboola First Party Audiences** | Leverage declared demographic data and behaviour signals from the premium publisher network. Layer with additional segments (e.g., interest in shopping **and** 25-45 age range). By default OR logic is applied for multiple segments; AND logic is available but **do not add more than 5 segments with AND logic** — it restricts reach. |
| **High Intent — Mail Retargeting (MRT)** | Curate audiences based on incoming mails from competing brands, your brand, or proxy signals. Create the segment **in advance** — allow **24-48 hours** for the audience to build. **Minimum 1,000 MAU** required; a warning appears if the audience is too small. |
| **High Intent — Search Retargeting (SRT)** | Curate audiences based on search queries for competitor brands. Use **broad match** for maximum scale. Create the segment in advance (24-48 hours). Ensure creative headline / description matches segment criteria — e.g., targeting competitor shoe brands → highlight brand / product USPs. |
| **Contextual and Topic Segments** | Select based on the audience's reading interests. When using contextual segments, tailor creative messaging to the segment selection. |
| **Optimise for Engagement** | Use engagement conversions (time on site, session depth) to target high-intent audiences. Relevant for mid-to-lower funnel goals. Use as part of retargeting strategy or alongside additional segments to lead users through the funnel. |
| **Third-Party Marketplace Segments** | Select from 20+ third-party data providers including Audience One, Bombora, Connexity, Eyeota. Additionally layer with Taboola First Party Audiences (demographic or interest-based). |
| **Advertiser Pixel Audiences (first-party)** | Use the pixel for retargeting (users who clicked on ads or visited the website). Use as part of inclusion / exclusion strategy — e.g., excluding users who already completed a conversion event. |
| **Predictive Audiences** | Use alongside always-on or broad-targeted campaigns as complementary targeting. **Always create a new campaign** for a predictive audience. Can be built from pixel or S2S event. **Mandatory: 100 conversions** needed to create a segment. Build the segment and allow up to 48 hours to activate before discussing upsell with the advertiser. |
| **CRM Segments** | Upload CRM list to retarget. Minimum **1,000 user records** recommended. Watch the Reach Estimator — low volume leads to low spend and performance. **Available in select markets only.** |
| **CRM Lookalike** | **US-based accounts only.** Set the lookback window long enough to capture the entire consideration phase (max 180 days). Regularly update source data for maximum reach. |

### Pro Tip

Monitor the **Reach Estimator** to ensure the audience isn't too narrow. Start broad, then refine targeting based on performance.

Use the **Audience Toolbox** to find additional audience segments.

---

## Inventory and Placements

### Starting Point

The recommended starting point for most advertisers is **premium editorial supply** — relevant across all marketing objectives and verticals. This gives flexibility to adjust site targeting (include / exclude specific sites).

### Environment Expansion (Once Performance Stabilises)

| Environment | Marketing Objectives | Recommended Verticals | Guidance |
|---|---|---|---|
| **Mail Inventory** | Lead Generation, Online Purchases, Website Engagement | Retail, Finance, Tech / Telco, CPG, Travel | High-intent, lean-in environment. Best introduced as an incremental campaign once premium editorial supply stabilises. |
| **Apple News & Stocks** | Page Views, Engagement | Premium publishers; content-consumption or editorial KPIs | Quality traffic and engaged readership. Start with Run-of-Network; add contextual segments only if performance requires refinement. |
| **Lockscreen Inventory** | Efficient Traffic Generation, Geo-targeted Leads / Conversions | Search advertisers, Premium publishers, Home & Garden, Automotive, Regional campaigns | Cost-efficient reach and localised impact. Pair with strong CTAs and geo-relevant messaging. |

---

## Scaling: Audience Expansion

### When to Expand

- Noticing saturation in reach (impressions / views).
- Budget depletion is lower than expected.
- Targeting a niche audience while performance is OK.

### Expansion Options

| Option | How |
|---|---|
| **Audience Exploration Tab** | For Run-of-Network campaigns, use the audience-exploration tab to get insights into segments you're not currently targeting. |
| **Add similar segments** | For campaigns targeting specific audiences, add similar audience segments or use combined audiences (interest + intent + demographic). |
| **Marketplace / Taboola First Party Audiences** | Narrow down on specific audiences based on the advertiser's product / service. |
| **Predictive Audiences** | Reach high-intent audiences based on pixel / S2S events. Ensure the conversion event has sufficient data (up to 100 conversions). Advertisers optimising toward page views or similar upper-funnel events are not eligible. |

**Why this works:** Broadening the audience base using data-backed insights allows the algorithm to find new conversion opportunities while maintaining efficiency through predictive and contextual alignment.

### Scaling Levers Summary

| Lever | When to Use | Guidance | KPIs to Monitor |
|---|---|---|---|
| **Audience expansion** | Reach saturation, or targeting niche while performance is OK | Add marketplace or Taboola First Party Audiences + engaged audiences (including attentive audience) | CPA / CPC. Watch the Reach Estimator. |
| **Budget increase** | Budget depletion OK and CPA / CPC acceptable, or seasonality adjustments | Increments of **up to 20%** at a time. Allow campaign time to recalibrate before further changes. | CPA / CPC / ROAS. Monitor pacing. |
| **Site exclusions** | Spend going to sites not contributing conversions, or with high CPC / CPA | Monitor site performance, exclude 10-20 underperforming sites | CVR. Continue monitoring post-exclusion. |
| **Custom Rules** | Specific rules for select campaigns | Start with broad rules to avoid significant performance impact (e.g., block sites with spend but no conversions over 7 days). | Spend / CPA. Monitor rules action under the Rules tab. |

---

## Retargeting Campaigns

### Retargeting Options

| Option | Details | Best Practice |
|---|---|---|
| **Pixel Segments** | Create a dynamic predictive audience from existing pixel events | Select a conversion event with at least **100 conversions in the last 7 days**. Create the segment and wait for it to populate (segments can be rejected based on algorithmic considerations). |
| **Attentive Audience** | Users who spent significant time on the site but didn't convert. Built automatically from recurring visits and time on site. | Ideal alongside an always-on campaign for lower-funnel objectives (leads, purchases). Use in combination with other retargeting segments to boost reach / scale. |
| **CRM Segments (first-party)** | Upload CRM list to retarget | Upload at least **1,000 user records**. Watch the Reach Estimator — low volume = low spend. **Available in select markets only.** |
| **Search Retargeting (SRT)** | Segments based on specific search keywords | Reaches high-intent audiences. Can be smaller in scale — combine with other retargeting segments. **Available in select markets only.** |
| **Mail Retargeting (MRT)** | Segments of users who received emails from specific domains | Primary use case: competitor conquesting. **Available in select markets only.** |

---

## Additional Targeting Campaigns

### Options Beyond Run-of-Network

| Targeting Option | Use Case |
|---|---|
| **Contextual and topic targeting** | Target a context-specific audience (financial planning, health / fitness). Create a separate campaign (vs. marketplace segments). Create custom topic segments for niche products. |
| **Optimise for engagement** | Create custom engagement events (time on site, session depth). Relevant for mid-to-lower funnel goals, or engagement KPIs (page views, clicks). |
| **Targeted creative / LP testing** | Include different ad messaging variations and formats (static, motion, carousel). Pair creative messaging with tailored landing pages and monitor performance. |
| **Site targeting** | For advertisers with significant learnings. Use cases: maximise impact for short-burst / seasonal campaigns, or target a curated premium publisher list. |

---

## Guardrails

- Never use more than 5 segments with AND logic — it restricts reach too much.
- Never create a predictive audience from upper-funnel events (page views) — not eligible.
- Never launch MRT or SRT without allowing 24-48 hours for the audience to build.
- Never use pixel retargeting without a minimum of 100 conversions in the seed event.
- Always start with broad targeting for new campaigns, then refine based on performance.
- Always create a **new campaign** for predictive audience targeting — never add to an existing campaign.
- Always monitor the Reach Estimator to ensure the audience isn't too narrow.
- Always tailor creative messaging to match the specific targeting segment.

## Common Mistakes

1. **Too many AND segments.** Audience too small. Max 5 segments with AND logic.
2. **Not waiting for audience build.** MRT / SRT / Predictive targeting empty audiences. Allow 24-48 hours.
3. **Insufficient seed data for Predictive.** Poor audience quality. Need 100+ conversions.
4. **Same messaging for all segments.** Lower relevance, lower CTR. Tailor creatives to each segment.
5. **Expanding everything at once.** Can't isolate what worked. One expansion lever at a time, wait to measure.

## Pro Tips

- Use the **Audience Toolbox** to find additional audience segments for expansion.
- For **always-on campaigns**, use the Audience Exploration tab to discover untapped segments.
- **MRT is powerful for competitor conquesting** — targeting users who receive emails from competitor brands. One of the most underused targeting features.
- SRT works best with **broad match** for maximum scale. Ensure creative headlines match the search keywords being targeted.
- When expanding targeting for a campaign near audience saturation, consider creating a **parallel campaign** that excludes the top sites — redistributes budget and uncovers new performance pockets.
