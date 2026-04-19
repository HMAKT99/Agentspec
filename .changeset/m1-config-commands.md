---
"@mdpact/config": minor
"@mdpact/core": patch
"@mdpact/rules": patch
"@mdpact/cli": minor
---

Milestone 1 — part 1: config loader + `init`, `explain`, `score` commands + `github` output format.

- New `@mdpact/config` package with zod schema, `defineConfig` helper, and loader that accepts TS / JS / JSON / YAML config files, with helpful Zod-derived error messages.
- CLI auto-discovers spec files from `config.specs` when no paths are given to `lint` / `score`.
- `mdpact init` scaffolds `mdpact.config.ts`, detects known spec files (CLAUDE.md, AGENTS.md, `.cursorrules`, GEMINI.md, copilot-instructions), adds `.mdpact/` to `.gitignore`.
- `mdpact explain <rule-id>` prints rule metadata + docs URL.
- `mdpact score` computes the static score per spec §10, with `--threshold` override + pretty/JSON output.
- `mdpact lint --format github` emits GitHub Actions workflow annotations.
- `--max-warnings` on `lint` with exit code 2 when exceeded.
