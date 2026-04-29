# Changelog

All notable changes to this plugin will be documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).

## [Unreleased]

### Added
- New `optimize-campaign` skill — data-driven diagnosis and recommendation loop grounded in Taboola's [official performance optimization guide](https://www.taboola.com/help/en/articles/3878108-how-to-improve-campaign-performance). Covers the 100+ clicks per item threshold, 8× CPA goal daily-spend rule, metric-combination prescription rules (CTR × CVR × CPA), and concrete UI-action recommendations with exact UI paths.

### Added
- Embedded the **realize-toolkit** as a knowledge layer. Plugin now ships `os/guardrails.md` (consolidated system-prompt: brand, tone, output structure, attribution, formatting, entity references), `knowledge/` (10 topic MDs: bidding, budget, brand-safety, campaign-structure, creative, custom-rules, environments, site-management, targeting, tracking, plus manifest.json), and `scripts/brand-check.sh` (linter, adapted to allow `item_id` as a public MCP parameter). Agent (`realize-analyst`) loads `os/guardrails.md` at session start and consults `knowledge/<slug>.md` for topic-specific Realize questions.

### Changed
- Consolidated the `os/` system-prompt layer from 4 files into 1. `os/tone.md`, `os/orchestration.md`, and `os/routing.md` were folded into `os/guardrails.md` (tone fully merged; orchestration's Output structure / brevity / scope-footer rules merged; routing dropped — Claude Code's skill-routing handles intent matching natively). Synced to both repos.

### Changed
- Aligned signal-quality thresholds (100+ clicks per item, daily spend ≥ 8× CPA goal) with the realize-toolkit's operational guidance. Plugin previously used the official article's looser thresholds (500–1000 clicks, $50/day flat). Toolkit treated as authoritative. (These thresholds now live in the `optimize-campaign` skill; the toolkit's former `os/orchestration.md` was consolidated into `os/guardrails.md` under the same Apr 2026 simplification.)
- Aligned brand language with the Apr 2026 PMM brand guardrails: feature renames (Realize Pixel → Taboola Pixel; Marketplace Audiences → Taboola First Party Audiences), UI naming (Realize console → Realize UI), and removed "Taboola Realize" usage in favor of "Realize" alone.
- Added attribution + timeframe rule to `realize-analyst` agent and `reports` skill — every CPA / CVR / Leads / ROAS figure must specify both attribution basis (CT / VT / Total) and timeframe.
- Aligned creative-variation guidance with the realize-toolkit (`3 distinct titles + 3 unique images per campaign`), and ad-volume guidance (`4–6 ads per campaign, never more than 10`). Fixed Bid budget formula updated to "per client requirements" (toolkit treats Fixed Bid as fully manual).
- `create-campaign` skill rewritten with the exact setup flow from Taboola's [official setup guide](https://www.taboola.com/help/en/articles/10473049-setting-up-a-new-campaign): correct navigation (`Campaigns → +New → Campaign`), 5-value Marketing Objective enum, 3-value Bid Strategy enum with budget minimums (10× CPA for Maximize Conversions; 5× daily / 150× monthly for Enhanced CPC; Fixed Bid set per advertiser requirements), 100–200 clicks/day rule for non-conversion campaigns, 4–6 ads per campaign recommendation (never more than 10), 7–10 day learning phase, 24–48 hour review cycle, and explicit guidance against narrowing targeting at launch.
- Agent `realize-analyst`: added optimization-routing example and responsibility, and updated the create-campaign example to reflect the fuller setup flow.
- README: added `optimize-campaign` row to skills table and expanded natural-language examples with optimization and setup prompts.

## [0.1.0] — 2026-04-24

### Added
- Initial scaffold: `.claude-plugin/plugin.json`, `.mcp.json` wiring the remote Realize MCP at `https://mcp.realize.com/mcp` via `type: http` (Claude Code's `.mcp.json` vocabulary for the streaming HTTP transport).
- `realize-analyst` orchestrator agent.
- Skills: `accounts`, `campaigns`, `reports` (with `references/report-fields.md` and `references/csv-examples.md`), `create-campaign` (UI walkthrough for actions not currently exposed as MCP tools).
- `tests/test-scenarios.md` — 11 manual QA scenarios.
- Governance docs: README, CLAUDE.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md.
- CI workflow: `.github/workflows/validate.yml` — JSON + YAML frontmatter validation.
