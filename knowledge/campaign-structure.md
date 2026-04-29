# Campaign Structure

## Overview

Campaign structure determines how budgets are distributed, how the algorithm optimises, and how reporting is organised. Correct structure prevents budget cannibalisation, simplifies optimisation, and makes performance analysis actionable. This file covers Campaign Groups, objectives, campaign types, and scheduling.

---

## Campaign Groups

### What Campaign Groups Do

A **Campaign Group** is a layer between the account and campaigns:

- **Campaign Group** = the "What" (the objective and KPI).
- **Campaign** = the "How" (tactics — targeting, platforms, creative formats, supply type).

| Feature | What It Does |
|---|---|
| **Budget Distributor** | Automatically allocates daily / total budget across campaigns in the group. |
| **Unified Reporting** | Aggregates performance across all campaigns in the group. |
| **Flight Dates** | Sets start / end dates that apply to all campaigns in the group. |

### Grouping Rules

- All campaigns within a Campaign Group must optimise toward the **same** marketing objective and KPI.
- For every different marketing objective and KPI, create a separate Campaign Group.
- Never mix campaigns with different objectives under the same Campaign Group.
- There is no limit to the number of campaigns you can create under a Campaign Group.

### When to Create Separate Campaigns Within a Group

Campaigns within a group should vary by optimisation tactic:

- Audience targeting (broad, contextual)
- Platform targeting (mobile, desktop)
- Creative formats (display, carousel, Sponsored Content)
- Supply type (Mail, Apple News)
- Bidding strategy
- Creative messaging angles

### Budget Distributor Behaviour

The current Budget Distributor allocates budget based on **reach / scale**, not performance:

- A narrow-targeting campaign with great performance may be limited in scale, so the Budget Distributor prioritises broader-targeted campaigns to ensure budget depletion.
- Later versions will optimise budget allocation based on performance (CVR, CPA).

**Key requirements when using the Budget Distributor:**

- Always set all campaigns to the **same bidding strategy**.
- Always ensure conversion goals are the **same** across all campaigns in the Campaign Group.

### Decision Table

| Scenario | Use Group? | Why |
|---|---|---|
| Big budget, long engagement period | Yes, multiple campaigns | Try multiple strategies / optimisation tactics. |
| Tight budget, ROAS goal | Yes, but start limited | Open up once you prove performance. |
| Different marketing objectives | No — separate groups | Each objective needs independent optimisation. |
| Single campaign | No | No benefit to grouping. |

---

## Campaign Objectives

### The 5 Objectives

Choosing the right marketing objective is critical — it determines how the algorithm learns and optimises.

| Objective | When to Use | Best Suited For |
|---|---|---|
| **Lead Generation** | Advertiser wants to drive leads through email sign-ups, form fills, or demo requests | Advertisers with a long-tail funnel, possibly with an offline conversion event. |
| **Online Purchases** | Advertiser wants to drive purchases for a product / service | E-commerce or D2C advertisers selling a specific product. |
| **Website Engagement** | Advertiser wants to increase page views, clicks, or time spent on site | Driving qualified traffic or creating warm audiences for further funnel targeting. |
| **Brand Awareness** | Advertiser wants to increase visibility and recall | New brands or product-launch information. |
| **App Installs** | Advertiser wants to drive mobile app installs | App-first brands or brands expanding mobile app usage. |

### Objective Selection Decision Rules

| Advertiser Goal | Correct Objective | Common Mistake |
|---|---|---|
| "I want sales" | Online Purchases | Setting Lead Generation (wrong optimisation target). |
| "I want leads / sign-ups" | Lead Generation | Setting Website Engagement (optimises for traffic, not leads). |
| "I want app downloads" | App Installs | Setting Lead Generation (different tracking / attribution). |
| "I want people to know my brand" | Brand Awareness | Setting Website Engagement (similar but different optimisation). |
| "I want traffic to my blog" | Website Engagement | Setting Lead Generation (no conversion to optimise for). |

- Never change the objective after campaign launch — this resets the algorithm completely.
- If the objective was set wrong, create a new campaign with the correct objective.

---

## Campaign Types

### Sponsored Content (Native) vs. Display

| Dimension | Display Ads | Sponsored Content |
|---|---|---|
| **Format** | Traditional banner ads, standard IAB sizes. Entire message conveyed within the ad itself, without headline / description. | Static images, motion ads, carousels. Always include headline, description, and CTA within the card. |
| **Placement** | Dedicated ad spaces around content (banner positions). | Within the content feed or editorial environment. |
| **Intent** | Effective for intent prospecting, boosting engagement, and building high-value audiences. | Closely aligned with user intent, effective at driving lower-funnel conversions. |
| **Performance** | Higher-impact, engagement-oriented campaigns. Standard IAB sizes for maximum scale. Optimised for visibility and reach. | Key driver at every stage of the funnel, especially lower-funnel. Seamless integration with content. |

### Campaign Type Decision Matrix

| Scenario | Type | Why |
|---|---|---|
| First campaign on Realize | Sponsored Content (Native) | Higher engagement, better for learning phase, key driver for lower-funnel. |
| Scaling after Sponsored Content success | Add Display campaign | Incremental reach on new placements, non-feed environments. |
| Advertiser has mid-funnel KPIs | Display or mix | Display is effective for engagement and audience building. |
| Advertiser has lower-funnel KPIs | Sponsored Content | Excels at driving conversions. |
| Advertiser has display assets only | Display | Use what exists; plan Sponsored Content creative development. |
| Advertiser has both asset types | Separate Sponsored Content + Display campaigns | Never combine — they need independent optimisation. |

- Always create separate campaigns for Sponsored Content (Native) and Display — never mix in one campaign.

---

## Scheduling

### When to Use Scheduling

| Scenario | Recommendation |
|---|---|
| One-time campaigns (e.g., Black Friday sale, product launch) | Specify start / end date (defaults to immediate start once approved). |
| Always-on campaigns | No end date. Review monthly. |
| Clear historical performance data for specific days / times | Apply dayparting to set ads for those days / times. |
| No historical data | Do not apply dayparting — start 24/7. |

- Only use dayparting when there is clear historical performance data showing consistent preference for specific days or times.
- Never apply scheduling restrictions at launch without data.

---

## Campaign Hierarchy

```
Account
└── Campaign Group (the "What" — objective + KPI)
    └── Campaign (the "How" — tactics)
        └── Ads (items)
```

- Realize uses Campaign Groups; there is no sub-layer beneath them.
- All ads in a campaign share the same targeting, bidding, and budget settings.
- To test different targeting or bidding, create separate campaigns.

---

## Guardrails

- Never change the campaign objective after launch — create a new campaign instead.
- Never combine Sponsored Content (Native) and Display in one campaign.
- Never mix campaigns with different objectives under the same Campaign Group.
- Always set all campaigns in a group to the same bidding strategy when using the Budget Distributor.
- Always ensure conversion goals are the same across all campaigns in a group.
- Always use separate campaigns for separate optimisation tactics (different targeting, different bid strategies, different supply types).

## Common Mistakes

1. **Wrong objective selected.** Algorithm optimises for the wrong action. Create a new campaign with the correct objective.
2. **Mixing objectives in one Campaign Group.** Budget Distributor can't optimise. Separate groups per objective / KPI.
3. **Mixing Sponsored Content + Display.** Algorithm can't optimise across format types. Separate campaigns.
4. **Different bidding strategies in one group.** Budget Distributor conflicts. Use the same bidding strategy across the group.
5. **Different conversion goals in one group.** Confusing optimisation signals. Align conversion goals across all campaigns in the group.

## Pro Tips

- Campaign Groups with the Budget Distributor are powerful for advertisers testing multiple tactics — remember the current version optimises for reach / scale, not performance. A narrow high-performing campaign may get less budget than a broad lower-performing one.
- When an advertiser wants to "restart" a poorly performing campaign, it is often better to create a fresh campaign. Building a new campaign resets the learning phase and removes historical constraints. Pair it with fresh creatives, new segments, or re-evaluated bidding strategies.
- Always optimise toward a specific product or funnel per account. Do not mix different products and completely different funnels on the same account.
