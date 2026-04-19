---
"@agentspec/web": minor
"@agentspec/rules": minor
"@agentspec/engine": minor
"@agentspec/cli": patch
---

Editor workbench, live examples, cross-file rules, drift detection.

### `/editor` route (`@agentspec/web`)
Monaco-based editor with five right-pane tabs: **Heatmap** (attention-wall visualization of binding rules vs the 4K-token threshold — the headline USP), **Outline** (heading tree with rule-count pills), **Preview** (remark-rehype rendered markdown), **Review** (keyboard-driven J/K diagnostic triage with Accept/Skip — the "review .md" kick), **Problems** (flat list). Monaco is dynamically imported so landing-page visitors don't pay the ~1 MB cost. Opens preloaded with the existing bad-claude fixture; persists to localStorage; accepts a `?spec=<base64>` share URL.

### `/examples` route (`@agentspec/web`)
Eight canned input/output pairs running the real lint pipeline in-browser. Left rail picks an example; right pane shows the input markdown, live diagnostics, score, and a one-paragraph explanation. Each example has an "Open in editor →" link that base64-encodes the snippet into `/editor`.

### Cross-file rules (`@agentspec/rules`)
Two new rules that use the previously-unused `ctx.allSpecs` surface to lint across multiple spec files:

- **`conflict/cross-binding`** (error) — binding directives in different spec files (e.g. `CLAUDE.md` vs `AGENTS.md`) contradict. Same verb + object, opposite polarity.
- **`conflict/cross-tool-policy`** (warning) — a backticked tool is treated as permitted in one file and restricted in another.

Catalog count: 20 → 22 rules. Fixture harness unchanged; new rules are covered by dedicated vitest suites (50 tests total, up from 42).

### Drift detection (`@agentspec/engine`)
`createDriftRules(report, { adherenceThreshold, minRunsPerTag })` — a rule factory closed over a `BehaviorReport`. For every task tag, aggregates `acted` / `deviated` / `refused` / `clarified` outcomes across runs and computes adherence. If observed adherence falls below the threshold (default 70% over at least 3 runs), emits a `behavior/drift` diagnostic anchored to the first spec rule whose text matches any token of the tag — or at line 1 otherwise. This is the first rule where the lint layer calls the *spec* a liar about what the agent does, not just flags static inconsistencies.

### CLI wiring (`@agentspec/cli`)
`agentspec test` now composes `createDriftRules` alongside `createBehaviorRules` so both fire against the spec after a behavior run.

### Internal fix
Rewrote `useDebouncedLint` to run parse + lint on the main thread (sub-50 ms on any realistic spec). The previous `new Worker(new URL('./lint-worker.ts', import.meta.url))` path failed to resolve workspace packages under Next 15's worker build pipeline, leaving the editor and examples pages stuck on "running…". The worker file is removed; the hook's public shape is unchanged so all consumers keep working.
