# Realize UI deeplinks

When the plugin needs to redirect the user to the Realize UI for an action it can't perform via MCP (UI-only domains: site block-list edits, Custom Rules, CRM uploads, lookalike seed creation, conversion-event creation, attribution-window changes, campaign delete/duplicate/bulk ops, GenAI Ad Maker, billing, tracking diagnostics), surface a **deeplink** rather than just a textual path through menus. Deeplinks reduce friction — the user clicks once instead of navigating.

## Base URL

The Realize UI lives at `https://ads.taboola.com` (the production-facing Realize platform for advertisers). Confirm the exact subdomain for the user's environment at session start if it differs (sandbox, regional variants).

> **Note:** if you're unsure whether a deeplink template below resolves correctly for the user's specific account, present the deeplink as a "try this URL" plus the menu-path fallback in the same redirect. Don't promise a deeplink that 404s.

## Deeplink templates

Replace `<ACCOUNT_ID>` with the user's opaque `account_id` (the string form from `search_accounts`, e.g., `pumikademoaccount`, NOT the numeric console ID). Replace `<CAMPAIGN_ID>` with the campaign's numeric ID.

| Destination | URL template | Menu-path fallback |
|---|---|---|
| **Campaigns list** (account-level) | `https://ads.taboola.com/accounts/<ACCOUNT_ID>/campaigns` | Realize UI → switch to account → Campaigns |
| **Single campaign — edit** | `https://ads.taboola.com/accounts/<ACCOUNT_ID>/campaigns/<CAMPAIGN_ID>/edit` | Realize UI → Campaigns → row → Edit |
| **Single campaign — Advanced Options (block list, brand safety)** | `https://ads.taboola.com/accounts/<ACCOUNT_ID>/campaigns/<CAMPAIGN_ID>/edit?section=advanced` | Realize UI → Campaigns → row → Edit → Advanced Options |
| **Delete a campaign** | (no deeplink — UI-only via overflow menu) | Realize UI → Campaigns → row's `⋯` menu → Delete |
| **Duplicate a campaign** | (no deeplink — UI-only via overflow menu) | Realize UI → Campaigns → row's `⋯` menu → Duplicate |
| **Conversions / Tracking** | `https://ads.taboola.com/accounts/<ACCOUNT_ID>/tracking/conversions` | Realize UI → Tracking → Conversions |
| **New conversion event** | `https://ads.taboola.com/accounts/<ACCOUNT_ID>/tracking/conversions/new` | Realize UI → Tracking → Conversions → + New |
| **Pixel status (Taboola Pixel)** | `https://ads.taboola.com/accounts/<ACCOUNT_ID>/tracking/pixel` | Realize UI → Tracking → Pixel |
| **Audiences** | `https://ads.taboola.com/accounts/<ACCOUNT_ID>/audiences` | Realize UI → Audiences |
| **New audience (CRM / lookalike seed)** | `https://ads.taboola.com/accounts/<ACCOUNT_ID>/audiences/new` | Realize UI → Audiences → + New Audience |
| **Custom Rules** | `https://ads.taboola.com/accounts/<ACCOUNT_ID>/custom-rules` | Realize UI → Custom Rules |
| **New Custom Rule** | `https://ads.taboola.com/accounts/<ACCOUNT_ID>/custom-rules/new` | Realize UI → Custom Rules → + New Rule |
| **GenAI Ad Maker** | `https://ads.taboola.com/accounts/<ACCOUNT_ID>/campaigns/<CAMPAIGN_ID>/inventory/genai` | Realize UI → Campaigns → open campaign → Campaign Inventory → GenAI Ad Maker |
| **Billing / Payments** | `https://ads.taboola.com/accounts/<ACCOUNT_ID>/billing` | Realize UI → Billing |
| **Support / Contact** (in-platform) | `https://ads.taboola.com/help` (or the user's account team email — see `os/guardrails.md`) | Realize UI → Help → Contact Support |

## When to surface a deeplink

Surface a deeplink whenever the redirect is for a **specific** UI page tied to the user's current context:

- ✅ "Open the campaign's block-list" → include `https://ads.taboola.com/accounts/pumikademoaccount/campaigns/47419232/edit?section=advanced`.
- ✅ "Create the conversion event" → include `https://ads.taboola.com/accounts/pumikademoaccount/tracking/conversions/new`.

Do NOT surface a deeplink when:
- ❌ The redirect is generic / not tied to a specific account (e.g., "see Taboola's published policy on health claims" — link to the policy, not to the UI).
- ❌ You're not sure the deeplink resolves correctly (e.g., feature behind a per-account beta flag). Use the menu-path fallback only.
- ❌ The action's URL is route-protected or requires extra navigation state (e.g., "filter the Campaigns list to PAUSED" — the filter doesn't persist in a URL). Give the menu path.

## Where this gets used

The `manage-campaigns` skill's UI fallback sections (delete, duplicate, bulk ops, Custom Rules, CRM upload, conversion-rule creation, lookalike seed, pixel diagnostics) — read this file when generating the redirect, and emit the deeplink alongside the menu path. The `optimize-campaign` skill's recommendations that route to UI-only actions do the same.

## Maintenance

If the Realize UI URL structure changes, update this file and the affected skill files in lockstep. CI does not currently validate deeplink resolvability — confirm manually after any change.
