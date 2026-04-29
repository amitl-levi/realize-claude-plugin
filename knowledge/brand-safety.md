# Brand Safety

## Overview

Brand safety ensures ads don't appear alongside content that could damage the advertiser's brand. Realize offers native tools (keyword blocking, topic targeting, publisher lists), third-party pre-bid integrations (DoubleVerify, IAS), and verification tags. This file covers all mechanisms and undesirable-placement handling.

---

## Realize Native Safety Solutions

For advertisers who prefer not to target specific topics or publishers but don't require third-party monitoring.

### Keyword Block & Topic Targeting

| Tool | What It Does | Notes |
|---|---|---|
| **Topic & Contextual Targeting** | Choose topics and contextually relevant articles that align with messaging | Contextual targeting alone does not ensure content will always align with brand safety standards. For enhanced safety, use DoubleVerify or IAS pre-bid solutions. |
| **Keyword Blocking** | Negative keyword targeting restricts the campaign from showing on pages with specific keywords in the title or URL | Example: Pepsi can block any page mentioning "Coke." Client should provide their list of terms / keywords. |

### Publisher Inclusion / Exclusion

For advertisers who want to entirely avoid specific publishers (not just article content).

| Tool | What It Does | Impact |
|---|---|---|
| **Approved Site Lists** | Client specifies which sites to run on | May significantly impact scale. |
| **Blocked Site Lists** | Client specifies which sites to exclude | May impact scale — monitor delivery. |

---

## Third-Party Pre-Bid Solutions (DoubleVerify, IAS)

Realize partners with **DoubleVerify (DV)** and **IAS (Integral Ad Science)** for pre-bid brand safety and suitability.

### What They Enable

- Filter out unsuitable content.
- Reduce brand safety issues.
- Seamless integration in the Realize UI.

### Setup Rules

| Rule | Details |
|---|---|
| Vendor selection | Brand / advertiser can select only **one vendor: DV or IAS** (not both). |
| No dual-layer | Brand should not apply pre-bid settings on both the DSP level and the Realize level. |
| Documentation | **Always request** a copy of the advertiser's blueprint (DV) or media plan (IAS) before setup — contains all pre-bid requirements. |
| DV access | For DV, request that Taboola be added as a "media partner" for data / reporting access. |
| Language support | Not all languages are supported (e.g., Hebrew is not supported by DV). |
| Scale impact | Adding more brand-safety selections limits supply availability. |

### Pre-bid Applicability

Can be applied to **all campaigns set up directly in Realize.**

---

## Third-Party Tags (Monitoring)

Realize accepts third-party tags from DV and IAS for **monitoring** brand safety and viewability. These can be added at campaign or ad level as a third-party image pixel or JavaScript tag.

### Limitations

| Limitation | Details |
|---|---|
| **Blocking tags** | Industry limitations cause issues with blocking tags. Use pre-bid solutions instead. |
| **JavaScript tags** | If the client wants to monitor viewability and brand safety using JS tags, expect a reduction in scale. API publishers (Yahoo!, MSN) do not accept JavaScript tags — ads will not serve on those environments when JS tags are applied. |

---

## Troubleshooting: Undesirable Placements

### When an Advertiser Complains

| Step | Action |
|---|---|
| 1 | **Revisit brand-safety controls.** Tighten filters for adult content, sensitive / controversial topics, or underperforming inventory. |
| 2 | **Create topic segments as exclusion lists.** Build topic segments and use as negative targeting across campaigns to proactively avoid unwanted categories. |
| 3 | **Review site report and set up site exclusion.** Monitor site performance in the Realize UI. Take action only when sufficient data exists (see thresholds below). |
| 4 | **Create Custom Rules if needed.** Block sites based on performance or specific metrics (CPA, CTR, zero-conversion spend). |

### Data Thresholds for Site Exclusion Decisions

Only take site-exclusion decisions when you have:

1. **Campaign Clicks ≥ 500** **and** **Campaign Conversions ≥ 5** (ensures campaign CVR is relatively stable).
2. **Site level:** either of the following:
   - **Site Clicks ≥ 100**, or
   - **Site Clicks ≥ 2 ÷ Campaign_average_CVR** (the number of clicks that would have generated 2 conversions under the campaign's average CVR).

---

## Guardrails

- Never apply DV and IAS simultaneously — choose one vendor only.
- Never apply pre-bid settings on both DSP level and Realize level.
- Never assume contextual targeting alone ensures brand safety — recommend DV or IAS pre-bid for enhanced safety.
- Never add brand-safety restrictions without communicating scale impact to the advertiser.
- Never dismiss advertiser placement concerns — always investigate and take action.
- Never exclude sites without meeting the data thresholds (Campaign Clicks ≥ 500, Conversions ≥ 5).
- Always request the DV blueprint or IAS media plan before setup.
- Always verify language support (Hebrew is not supported by DV).
- Always warn that JavaScript tags reduce scale (API publishers like Yahoo / MSN do not accept them).

## Common Mistakes

1. **Using both DV and IAS.** Only one vendor allowed. Choose one.
2. **Pre-bid on both DSP and Realize.** Conflicting filters. Apply on one platform only.
3. **No documentation before setup.** Misconfigured safety settings. Always get the blueprint / media plan first.
4. **JavaScript tags without scale warning.** Yahoo / MSN won't serve ads. Warn advertiser about reach reduction.
5. **Excluding sites without data.** Premature blocking. Wait for the threshold (500 clicks, 5 conversions).
6. **Relying on contextual targeting alone for safety.** Gaps in coverage. Add DV or IAS pre-bid for sensitive brands.

## Pro Tips

- Adding more brand-safety selections limits supply availability — always discuss the trade-off between safety and scale with the advertiser.
- For DV, request that Taboola be added as a "media partner" to get access to data and reporting.
- Topic segments as exclusion lists are powerful for proactive brand safety — build them before complaints happen.
- The site-exclusion data thresholds (500 clicks + 5 conversions at campaign level; 100 clicks or 2 / CVR at site level) ensure decisions are made on statistically meaningful data.
