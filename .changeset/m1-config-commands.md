---
"@agentspec/config": minor
"@agentspec/core": patch
"@agentspec/rules": patch
"@agentspec/cli": minor
---

Milestone 1 — part 1: config loader + `init`, `explain`, `score` commands + `github` output format.

- New `@agentspec/config` package with zod schema, `defineConfig` helper, and loader that accepts TS / JS / JSON / YAML config files, with helpful Zod-derived error messages.
- CLI auto-discovers spec files from `config.specs` when no paths are given to `lint` / `score`.
- `agentspec init` scaffolds `agentspec.config.ts`, detects known spec files (CLAUDE.md, AGENTS.md, `.cursorrules`, GEMINI.md, copilot-instructions), adds `.agentspec/` to `.gitignore`.
- `agentspec explain <rule-id>` prints rule metadata + docs URL.
- `agentspec score` computes the static score per spec §10, with `--threshold` override + pretty/JSON output.
- `agentspec lint --format github` emits GitHub Actions workflow annotations.
- `--max-warnings` on `lint` with exit code 2 when exceeded.
