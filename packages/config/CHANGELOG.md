# @mdpact/config

## 0.2.0

### Changed

- Default `config.specs` expanded from 2 entries (CLAUDE.md + AGENTS.md) to
  **13 entries** covering every common agent-instruction file format:
  - Claude family: `CLAUDE.md` (primary), `AGENTS.md` (primary — bumped from
    secondary; now the canonical open format, donated to the AAIF/Linux
    Foundation), `GEMINI.md` (secondary).
  - GitHub Copilot: `.github/copilot-instructions.md` (primary),
    `.github/copilot-cli-instructions.md` (secondary), `**/*.agent.md`
    (secondary, VS Code Copilot custom agents).
  - Cursor: `.cursorrules` (primary legacy), `.cursor/rules/**/*.mdc`
    (primary new multi-file).
  - Windsurf / Cline / Aider: `.windsurfrules` (primary), `.clinerules`
    (primary), `.aider.md` (secondary), `.aider-instructions.md` (secondary).
  - MCP: `**/*.mcp.md` (tool-spec).
- Any user-supplied `specs` still replaces the default entirely (not merged),
  so existing projects are unaffected.

## 0.1.0 — initial release

First public release. See the root README for the feature list and usage.
