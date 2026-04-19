---
"@mdpact/core": minor
"@mdpact/rules": minor
"@mdpact/cli": patch
---

Milestone 1 — part 2: full v1 rule catalog.

- `@mdpact/core` exposes `extractInlineCode` and adds `ParsedSpec.inlineCode` so tool-oriented rules can inspect backticked commands.
- Rule type loosened to accept zod schemas with optional inputs (enables rules to declare defaults via `.default(...)`).
- 17 new rules: conflict/scope-overlap, conflict/tool-policy, clarity/vague-directive, clarity/binding-ambiguous, clarity/pronoun-drift, clarity/undefined-term, tools/unknown-tool (opt-in via allowed list), tools/missing-when, tools/destructive-no-confirm, structure/no-frontmatter, structure/duplicate-heading, structure/no-sections, tokens/budget, tokens/buried-rule, compliance/missing-human-gate, compliance/pii-in-spec, compliance/secret-in-spec. Each rule ships with docs and good/bad fixtures that run as part of the test suite.
- Fixture harness supports per-fixture rule option overrides via `{good,bad}.config.json`.
