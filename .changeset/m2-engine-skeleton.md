---
"@mdpact/engine": minor
---

Milestone 2 — part 1: behavior-engine skeleton.

- New `@mdpact/engine` package exporting `predictBehavior`, `MockAdapter`, `DiskCache`, `NullCache`, `HeuristicClassifier`, and `loadTaskFile`.
- `ModelAdapter` interface with `id`, `modelVersion`, `call`, `tokenize`, and `costUsd`. Disk cache keys hash spec + task + model + modelVersion + run (content never stored in the key).
- Heuristic outcome classifier covers `refused` / `clarified` / `acted` / `deviated` with an `OutcomeClassifier` escape hatch for the cheap-model variant coming later.
- Budget guardrail aborts mid-run (no partial debit) and reports the shortfall on `BehaviorReport.budgetExceeded`.
- YAML / JSON task file loader with zod validation.

No real network adapters yet — those land next. Spec authors can already exercise the pipeline with `MockAdapter` in tests.
