---
"@mdpact/engine": minor
"@mdpact/config": minor
"@mdpact/cli": minor
---

Milestone 2 — part 2: real network adapters + `mdpact test`.

- `@mdpact/engine` ships `AnthropicAdapter`, `OpenAIAdapter`, and `GoogleAdapter`, each implementing `ModelAdapter` on top of the vendor SDK. Cost lookup uses the bundled `DEFAULT_PRICING` table (Claude 4.X lineup populated; other providers fall through to a zero-cost entry the user must override).
- `@mdpact/config` learns about models. Entries accept either a shorthand `"anthropic:claude-sonnet-4-6"` or a full object `{ provider, modelId, pricing?, maxOutputTokens? }`.
- New `mdpact test` CLI. Loads spec + tasks (YAML/JSON under `config.behaviorTests.path`), resolves the declared models into adapters, and runs the behavior-prediction engine with a USD budget guardrail (default `$1`). Caches responses under `.mdpact/cache` by default. Pretty and JSON output formats.

Pricing defaults are a best effort — when running live the source field annotates whether the rate came from the built-in table or from user config.
