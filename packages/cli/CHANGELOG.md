# @mdpact/cli

## 0.2.0

Second minor release. Larger by-default lint surface + richer score reporting.

### Added

- `mdpact lint` now auto-discovers 13 agent-instruction file formats out of the
  box (Claude family, GitHub Copilot repo + CLI + custom agents, Cursor legacy
  and new `.mdc` format, Windsurf, Cline, Aider, MCP tool specs) — up from 2.
  No config file needed; defaults come from `@mdpact/config@0.2.0`.
- `mdpact score` output gains an `empty spec` status row that fires the score
  cap at 40 when the new `structure/empty-spec` rule (from
  `@mdpact/rules@0.2.0`) triggers.

### Changed

- Integration test fixtures lengthened so they pass the new
  `structure/too-short` rule (≥50 tokens).
- Depends on `@mdpact/rules@0.2.0` and `@mdpact/config@0.2.0`.

## 0.1.0 — initial release

First public release. See the root README for the feature list and usage.
