export const DOCS_CONTENT: Record<string, string> = {
  "getting-started": `## Install

\`\`\`bash
pnpm add -D @mdpact/cli @mdpact/config
\`\`\`

npm and yarn work equivalently. Node 20 or 22 required.

## Scaffold a config

\`\`\`bash
npx mdpact init
\`\`\`

This detects existing CLAUDE.md / AGENTS.md / .cursorrules / copilot-instructions, writes an \`mdpact.config.ts\` at repo root, and adds \`.mdpact/\` to \`.gitignore\`.

## First lint

\`\`\`bash
npx mdpact lint
\`\`\`

With no paths, the command lints every file declared under \`config.specs\`. Expect real diagnostics the first time — most specs have at least one \`clarity/*\` or \`structure/*\` issue waiting to be found.

## Score it

\`\`\`bash
npx mdpact score
\`\`\`

One number between 0 and 100 you can gate PRs against. Use \`--threshold 80\` for a floor; the same number lives in \`config.score.failBelow\`.

## What's next

- [CLI reference](/docs/cli) — every command and flag
- [Configuration](/docs/config) — full \`mdpact.config\` schema
- [Rules](/rules) — the 18 built-in checks, each with rationale and fix guidance
- [GitHub Action](/docs/action) — PR comments, inline annotations, score-based gates
`,

  cli: `mdpact ships a single binary: \`mdpact\`. Every command supports \`--help\`.

## \`mdpact init\`

Scaffolds \`mdpact.config.ts\`, detects known spec files, edits \`.gitignore\`.

\`\`\`bash
mdpact init [--yes] [--force]
\`\`\`

## \`mdpact lint\`

Runs enabled rules against the target specs.

\`\`\`bash
mdpact lint [paths...] [--format pretty|json|github] [--max-warnings N]
\`\`\`

Exit codes: \`0\` clean, \`1\` errors, \`2\` warnings over \`--max-warnings\`.

## \`mdpact fix\`

Applies auto-fixable rule corrections in place.

\`\`\`bash
mdpact fix [paths...] [--unsafe] [--dry-run]
\`\`\`

Safe-only by default; \`--unsafe\` enables transformational fixes (e.g. inserting default frontmatter).

## \`mdpact score\`

Computes the static score (0–100). Fails the command below \`--threshold\`.

\`\`\`bash
mdpact score [paths...] [--threshold N] [--format pretty|json]
\`\`\`

## \`mdpact test\`

Runs the behavior-prediction engine against your declared models. Requires API keys in the environment.

\`\`\`bash
mdpact test [--models claude-sonnet-4-6,gpt-4o-mini] [--runs 5] [--budget-usd 1]
\`\`\`

Aborts mid-run without partial debit if the USD budget would be exceeded.

## \`mdpact diff <ref>\`

Compares lint state against a git ref. Prints a diff of introduced / fixed / unchanged diagnostics.

\`\`\`bash
mdpact diff main [--format markdown|json]
\`\`\`

## \`mdpact explain <rule-id>\`

Prints rule metadata and its documentation URL.

\`\`\`bash
mdpact explain conflict/binding
\`\`\`
`,

  config: `\`mdpact.config.ts\` accepts the following shape. Every field is optional; defaults are shown.

\`\`\`ts
import { defineConfig } from "@mdpact/config";

export default defineConfig({
  specs: [
    { path: "CLAUDE.md", binding: "primary" },
    { path: "AGENTS.md", binding: "secondary" },
  ],
  rules: {
    // "<rule-id>": "error" | "warning" | "info" | "off"
    "conflict/*": "error",
  },
  ruleOptions: {
    "tokens/budget": { max: 10_000 },
  },
  budgets: {
    tokens: 10_000,
    behaviorTestUsdMax: 5,
  },
  models: [
    // shorthand
    "anthropic:claude-sonnet-4-6",
    // or full form
    { provider: "openai", modelId: "gpt-4o-mini" },
  ],
  behaviorTests: {
    path: "mdpact/tests/",
    runsPerTask: 3,
  },
  score: {
    failBelow: 70,
  },
});
\`\`\`

## File formats

\`mdpact.config.ts\` is preferred (full TypeScript autocomplete). YAML and JSON files are also accepted in this order:

- \`mdpact.config.ts\`, \`.mts\`, \`.mjs\`, \`.js\`, \`.cjs\`, \`.json\`
- \`mdpact.config.yaml\`, \`.yml\`
- \`.mdpact.yaml\`, \`.yml\`

## Validation

Every field is parsed through a zod schema. Invalid configs fail with precise, path-scoped errors pointing to the offending field.
`,

  engine: `The behavior engine runs your spec against declared models and reports divergence. It's off by default — linting is fully static and free.

## How it works

1. \`predictBehavior\` takes your spec + a set of tasks + a set of \`ModelAdapter\`s.
2. For each \`(task, model, run)\` it calls the model with your spec as system prompt and the task's prompt as user input.
3. Each response is classified as \`refused\` / \`clarified\` / \`acted\` / \`deviated\` using a heuristic classifier.
4. Results aggregate into a \`BehaviorReport\` with per-task divergence, per-model variance, and cost totals.

## Cost guardrails

\`\`\`ts
predictBehavior({
  ...,
  budget: { usdMax: 1.00 },
});
\`\`\`

The engine aborts mid-run when the next call would exceed the budget. \`BehaviorReport.budgetExceeded\` reports the outcome. \`mdpact test --budget-usd\` wires this into the CLI (default $1).

## Caching

Responses are cached by a hash of \`(spec, task, model, model-version, run-seed)\`. Only the hash leaves the filesystem — spec content is never stored in the key. Cache lives at \`.mdpact/cache\` by default; \`mdpact test --no-cache\` skips it.

## Adapters

- \`AnthropicAdapter\` — \`@anthropic-ai/sdk\`
- \`OpenAIAdapter\` — \`openai\`
- \`GoogleAdapter\` — \`@google/genai\`

Custom adapters just need to implement \`ModelAdapter\` (\`id\`, \`modelVersion\`, \`call\`, \`tokenize\`, \`costUsd\`).

## Privacy

\`mdpact test\` is the only command that sends anything over the network. Everything else — \`lint\`, \`score\`, \`fix\`, \`diff\`, \`explain\` — runs entirely against local files.
`,

  action: `Run mdpact on every pull request. The action emits inline diff annotations, posts a sticky PR comment with score + diagnostics, and fails the check when the score drops below a configured threshold.

## Minimal workflow

\`\`\`yaml
name: mdpact

on:
  pull_request:
    paths: ["CLAUDE.md", "AGENTS.md", "**/*.mcp.md"]
  push:
    branches: [main]

jobs:
  mdpact:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: HMAKT99/Agentspec@main
        with:
          fail-below: "70"
\`\`\`

## Inputs

| Name | Description | Default |
| --- | --- | --- |
| \`config\` | Path to \`mdpact.config.*\` | auto |
| \`fail-below\` | Fail the check if score drops below | \`70\` |
| \`run-behavior-tests\` | Run the behavior engine (costs API credits) | \`false\` |
| \`models\` | Comma-separated subset of models | — |
| \`budget-usd\` | USD ceiling for the behavior run | \`1\` |
| \`comment\` | Post sticky PR comment | \`true\` |
| \`github-token\` | Token for the comment upsert | \`github.token\` |

## Outputs

- \`score\` — numeric score (0–100)
- \`errors\` — count of error-severity diagnostics
- \`warnings\` — count of warning-severity diagnostics

## Behavior tests in CI

Set \`run-behavior-tests: "true"\` and supply API keys via secrets.

\`\`\`yaml
      - uses: HMAKT99/Agentspec@main
        with:
          run-behavior-tests: "true"
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
          GOOGLE_API_KEY: \${{ secrets.GOOGLE_API_KEY }}
\`\`\`
`,
};

export function getDocContent(slug: string): string | null {
  return DOCS_CONTENT[slug] ?? null;
}
