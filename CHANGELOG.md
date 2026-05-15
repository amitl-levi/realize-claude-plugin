# Changelog

All notable changes to this plugin will be documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).

## [Unreleased]

## [0.3.0] — 2026-05-15

### Added
- Wired the 4 upstream MCP write tools (`create_campaign`, `update_campaign`, `create_native_item`, `update_native_item`) via the new `manage-campaigns` skill. Plugin can now create and update campaigns and native items directly from natural language — no UI walkthrough required for the common write paths.
- Tiered preview-and-confirm pattern for destructive writes. Every preview block (all tiers) leads with a mandatory `▶ WRITE TARGET: <account_name> (<account_id>)` header so the user always sees which account is being mutated before approving. Lighter one-line confirm reserved for the lowest-risk path (item `is_active` toggles).
- Mandatory `get_campaign` pre-read on any `update_campaign` call that touches a targeting block (geo / device / OS / browser / connection / audience / lookalike / contextual / publisher / dayparting / conversion-rules). Skill merges client-side and renders `Current X → After update X` in the preview so the targeting full-replace semantics can't accidentally wipe dimensions the user didn't mention.
- Item-update status gating in `update_native_item` flow: REJECTED items are refused with a recreate-instead suggestion; RUNNING/PAUSED items accept only `is_active` + minor metadata; PENDING_APPROVAL items are fully editable.
- Create-with-launch flow: when the user explicitly says "and launch it" / "set it active", `is_active=true` is included in the `create_campaign` payload and the preview surfaces the launch intent in the same confirm gate. Default remains PAUSED when launch intent is not stated.

### Changed
- Agent `realize-analyst` Tool Reference: new **Writes** subsection documenting the 4 write tools with `destructiveHint` / idempotency posture. "Tool-existence boundary" paragraph rewritten — no longer excludes writes; routes them through `manage-campaigns`. Core Responsibility #6 rewritten from "refuse write operations" to "route write operations to manage-campaigns" while preserving the never-fabricate guarantee.
- `campaigns` skill: read-only, with a one-line cross-link directing write intent to `manage-campaigns`.
- `optimize-campaign` skill: prescriptions for pause / bid / budget changes now cross-link to `manage-campaigns` for the MCP-backed application step. Site blocklists, creative variations, and structural rebuilds remain UI actions.
- README "Available Skills" table: `create-campaign` row replaced with `manage-campaigns`. Scope blurb updated — the plugin now does read + write campaign/item management, with a UI fallback retained only for delete / duplicate / bulk ops.
- `tests/test-scenarios.md` split into two files: `tests/test-scenarios-read.md` (read-only paths; safe against any account) and `tests/test-scenarios-write.md` (destructive paths; require explicit test-account opt-in with per-scenario side effects and cleanup). The writes file opens with a banner clarifying that Realize has no non-prod environment; testers must name the team's designated prod test account at the start of the run. Filename itself is part of the safeguard.

### Removed
- The `create-campaign` skill is renamed to `manage-campaigns`. The UI walkthrough survives, trimmed, as a fallback reference inside the new skill for **delete**, **duplicate**, and **bulk operations** — the only campaign/item actions the MCP still does not expose.
- The 0.2.0 "Not in scope" note disclaiming the 4 write tools — now in scope.

## [0.2.0] — 2026-05-14

### Added
- New `discovery` skill — read-only lookups for targeting / audience / publisher / conversion / time-zone / CTA-type catalogs. Wraps 9 upstream tools: `search_geos`, `search_techno`, `search_audiences`, `search_lookalike_audiences`, `search_contextual_segments`, `search_publishers`, `search_conversion_rules`, `list_time_zones`, `list_cta_types`. Designed for inventory queries (*"what audiences are configured?"*) and forward name → opaque-code resolution (*"DMA code for Atlanta?"*).
- New `optimize-campaign` skill — data-driven diagnosis and recommendation loop grounded in Taboola's [official performance optimization guide](https://www.taboola.com/help/en/articles/3878108-how-to-improve-campaign-performance). Covers the 100+ clicks per item threshold, 8× CPA goal daily-spend rule, metric-combination prescription rules (CTR × CVR × CPA), and concrete UI-action recommendations with exact UI paths.
- Embedded the **realize-toolkit** as a knowledge layer. Plugin now ships `os/guardrails.md` (consolidated system-prompt: brand, tone, output structure, attribution, formatting, entity references), `knowledge/` (10 topic MDs: bidding, budget, brand-safety, campaign-structure, creative, custom-rules, environments, site-management, targeting, tracking, plus `manifest.json`), and `scripts/brand-check.sh` (linter, adapted to allow `item_id` as a public MCP parameter). Agent (`realize-analyst`) loads `os/guardrails.md` at session start and consults `knowledge/<slug>.md` for topic-specific Realize questions.
- Agent Tool Reference grew from 9 to 18 read tools. Grouped: Accounts / Campaigns / Items / Discovery / Reports / Auth.
- `tests/test-scenarios.md` — five new scenarios (12–16) covering `search_audiences`, `search_geos` (DMA by country), `search_publishers`, `list_time_zones`, `list_cta_types`. All verified PASS against live MCP at 2026-05-14.

### Changed
- **MCP tool renames** to match upstream realize-mcp surface: `get_all_campaigns` → `list_campaigns`, `get_campaign_items` → `list_items`, `get_campaign_item` → `get_item`. Updated across the agent, the `campaigns` / `optimize-campaign` / `create-campaign` skills, the test scenarios, and the gap-analysis doc.
- Consolidated the `os/` system-prompt layer from 4 files into 1. `os/tone.md`, `os/orchestration.md`, and `os/routing.md` were folded into `os/guardrails.md` (tone fully merged; orchestration's Output structure / brevity / scope-footer rules merged; routing dropped — Claude Code's skill-routing handles intent matching natively).
- Aligned signal-quality thresholds (100+ clicks per item, daily spend ≥ 8× CPA goal) with the realize-toolkit's operational guidance. Plugin previously used the official article's looser thresholds (500–1000 clicks, $50/day flat). Toolkit treated as authoritative.
- Aligned brand language with the Apr 2026 PMM brand guardrails: feature renames (Realize Pixel → Taboola Pixel; Marketplace Audiences → Taboola First Party Audiences), UI naming (Realize console → Realize UI), and removed "Taboola Realize" usage in favor of "Realize" alone.
- Added attribution + timeframe rule to `realize-analyst` agent and `reports` skill — every CPA / CVR / Leads / ROAS figure must specify both attribution basis (CT / VT / Total) and timeframe.
- Aligned creative-variation guidance with the realize-toolkit (`3 distinct titles + 3 unique images per campaign`), and ad-volume guidance (`4–6 ads per campaign, never more than 10`). Fixed Bid budget formula updated to "per client requirements" (toolkit treats Fixed Bid as fully manual).
- `create-campaign` skill rewritten with the exact setup flow from Taboola's [official setup guide](https://www.taboola.com/help/en/articles/10473049-setting-up-a-new-campaign): correct navigation (`Campaigns → +New → Campaign`), 5-value Marketing Objective enum, 3-value Bid Strategy enum with budget minimums (10× CPA for Maximize Conversions; 5× daily / 150× monthly for Enhanced CPC; Fixed Bid set per advertiser requirements), 100–200 clicks/day rule for non-conversion campaigns, 4–6 ads per campaign recommendation (never more than 10), 7–10 day learning phase, 24–48 hour review cycle, and explicit guidance against narrowing targeting at launch.
- Agent `realize-analyst`: added optimization-routing example, discovery-routing example, and responsibility line for discovery. Updated the create-campaign example to reflect the fuller setup flow.
- README: added `discovery` and `optimize-campaign` rows to skills table; expanded natural-language examples with optimization, discovery, and setup prompts; refreshed scope blurb to note that upstream writes exist but are intentionally not wired here.
- `CLAUDE.md` architecture diagram: added `discovery` skill row; updated tool count to 18 reads + 4 upstream writes (not enabled).
- `docs/realize-best-practices-gap.md` capability baseline: bumped from 11 tools to 18 reads; added Discovery / Resources rows; surfaced the 4 unwired upstream writes.

### Removed (from public layer, per Maayan review)
- Competitor-naming bullet in `os/guardrails.md` (names competitors — can't appear publicly).
- Four directional sections moved to `guardrails-private.md` (internal layer, outside this repo): Preferred messaging direction, Framing rules, Emotional tone matching, "What the assistant is not."

### Not in scope
- Upstream realize-mcp exposes write tools (`create_campaign`, `update_campaign`, `create_native_item`, `update_native_item`). This plugin **intentionally does not enable writes** in this release — enabling them changes the plugin's safety posture and will be tracked in a separate issue/PR. Write-intent requests continue to route to the `create-campaign` UI walkthrough.

## [0.1.0] — 2026-04-24

### Added
- Initial scaffold: `.claude-plugin/plugin.json`, `.mcp.json` wiring the remote Realize MCP at `https://mcp.realize.com/mcp` via `type: http` (Claude Code's `.mcp.json` vocabulary for the streaming HTTP transport).
- `realize-analyst` orchestrator agent.
- Skills: `accounts`, `campaigns`, `reports` (with `references/report-fields.md` and `references/csv-examples.md`), `create-campaign` (UI walkthrough for actions not currently exposed as MCP tools).
- `tests/test-scenarios.md` — 11 manual QA scenarios.
- Governance docs: README, CLAUDE.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md.
- CI workflow: `.github/workflows/validate.yml` — JSON + YAML frontmatter validation.
