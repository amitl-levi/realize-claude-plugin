# Install the Realize Claude Plugin

> **Status:** the plugin is not yet published to a Claude Code marketplace. Until it is, **use the local-dev path below**. The marketplace path is documented for reference but won't work yet.

## Prerequisites
- [Claude Code](https://claude.ai/claude-code) CLI installed (`claude --version` works).
- A Realize account (Taboola SSO).
- Network access to `https://mcp.realize.com/mcp`.
- Git installed locally.

---

## Install — local-dev path (works today)

Clone the repo, then launch Claude Code with the `--plugin-dir` flag pointing at it:

```bash
git clone https://github.com/taboola/realize-claude-plugin
claude --plugin-dir ./realize-claude-plugin
```

That's it. `--plugin-dir` loads the plugin (skills, agent, and MCP wiring) directly from the local directory — no marketplace required.

On your first tool call, your browser opens for Taboola SSO. After sign-in, you can run prompts.

**Picking up code changes:** after `git pull`, run `/reload-plugins` inside the Claude Code session to refresh without restarting the CLI.

**Loading multiple plugins at once:** repeat the flag, e.g. `claude --plugin-dir ./realize-claude-plugin --plugin-dir ./other-plugin`.

---

## Install — marketplace path (once published)

The commands below are run **inside a Claude Code session at the prompt** (slash commands), not in your shell.

```
/plugin marketplace add <marketplace-source>
/plugin install realize-ads-api@<marketplace-name>
```

`<marketplace-source>` can be a GitHub shorthand (`owner/repo`), a full git URL, a local path, or a URL to a `marketplace.json`. `<marketplace-name>` is the `name` field declared in that marketplace's `marketplace.json`. The exact values will be filled in here once the Realize team publishes the marketplace.

---

## First run

After install, test with a read prompt:

```
List my Realize accounts.
```

If accounts come back, the install is good.

---

## Optional: opt in to skip the permission prompt for write tools

By default, the first call to each of the 6 Realize write tools (`create_campaign`, `update_campaign`, `create_native_item`, `update_native_item`, `create_display_item`, `update_display_item`) triggers a Claude Code permission prompt. This is **defense in depth on top of** the plugin's own preview-then-confirm gate (see [`os/guardrails.md`](os/guardrails.md) → "Write tool gate"). Both checks are recommended.

If you want to skip the harness-level prompt locally (the plugin gate still fires on every write):

```bash
cp .claude/settings.local.json.example .claude/settings.local.json
```

`settings.local.json` is gitignored — it is a per-user opt-in and is **not** shipped with the repo.

---

## Install on Codex (experimental)

> **Status:** the `.codex-plugin/` manifest exists in the repo but Codex support is not yet validated. Treat this section as a starting point; confirm the MCP URL/port for your Codex deployment before relying on it.

The Codex build wires the Realize remote MCP and ships the system-prompt + knowledge layer. The Claude Code skills (campaign creation workflows, optimization diagnostics, report aggregation) are not loaded on Codex; the **write tool gate is defined in [`os/guardrails.md`](os/guardrails.md)** so it applies on Codex too.

Two things differ from the Claude Code install:

1. **Manifest name.** Codex loads `.codex-plugin/plugin.json`, where the plugin is registered as `realize-ads-api` (not `realize`). When installing into a Codex marketplace, use `realize-ads-api` as the plugin slug.
2. **MCP URL / port.** The shared `.mcp.json` points at `https://mcp.realize.com/mcp` with OAuth callback port `3000`. The Codex build inherits this endpoint by default. Confirm with the Realize team whether your Codex deployment uses the same endpoint before installing — if Codex routes the realize-mcp differently, do not modify the shared `.mcp.json`; raise it with the Realize team for guidance on the correct override mechanism for your Codex environment.

After install, run a read prompt the same as on Claude Code:

```
List my Realize accounts.
```

If a write is attempted on Codex, the preview-then-confirm gate from `os/guardrails.md` fires identically — no skill is required.

---

## Troubleshooting

- **Browser didn't open for OAuth** → free port `3000`, retry.
- **`search_accounts` returns nothing** → wrong SSO realm; check your Taboola login.
- **Wrong account in a write preview** → re-run the `accounts` skill before retrying.
- **`/plugin install` says "unknown marketplace"** → the marketplace hasn't been added yet. Run `/plugin marketplace add <source>` first, or fall back to the local-dev path above.
- **Changes to a local plugin aren't visible** → run `/reload-plugins` inside the session.

Full docs: [README.md](README.md) · Claude Code plugin docs: https://code.claude.com/docs/en/plugins
