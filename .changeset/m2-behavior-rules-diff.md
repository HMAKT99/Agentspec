---
"@mdpact/engine": minor
"@mdpact/cli": minor
---

Milestone 2 — part 3: behavior rules + `mdpact diff`.

- `@mdpact/engine` exports `createBehaviorRules(report, { divergenceThreshold?, adherenceThreshold? })` — a factory that produces `behavior/divergence` and `behavior/unfollowed` rules closed over a `BehaviorReport`. Defaults mirror spec §6 (30% divergence, 80% adherence).
- `mdpact test` now runs the behavior rules against the lint pipeline after `predictBehavior`, printing any diagnostics alongside the behavior report and exiting non-zero when a behavior error fires.
- New `mdpact diff <ref>` command: lints the spec at the given git ref (default `main`) plus the working tree, diffs the diagnostics into introduced / fixed / unchanged buckets. Markdown and JSON output; exit code 1 if new diagnostics were introduced.
