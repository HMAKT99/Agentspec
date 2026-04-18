---
"@agentspec/action": minor
---

Milestone 3: GitHub Action.

- New `apps/action` package shipping a Node 20 GitHub Action.
- Runs lint on the current checkout, emits inline diff annotations via `@actions/core`, computes score + delta vs the base branch (via `git show origin/<ref>:<path>`), and posts a sticky PR comment keyed by an invisible marker.
- `action.yml` inputs: `config`, `fail-below` (default 70), `run-behavior-tests` (default false), `models`, `budget-usd` (default 1), `comment`, `github-token`. Outputs: `score`, `errors`, `warnings`.
- Bundled via `@vercel/ncc` into `apps/action/dist/index.js` (committed so downstream consumers can `uses: HMAKT99/Agentspec@main` without extra setup).
- Example workflow at `examples/workflows/agentspec.yml` and per-action README under `apps/action/README.md`.
