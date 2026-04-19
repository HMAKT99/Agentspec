# mdpact GitHub Action

Run mdpact on every pull request. Emits inline annotations, posts a sticky PR comment with score + diagnostics, and fails the check when the score drops below a configured threshold.

## Minimal workflow

```yaml
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
      - uses: HMAKT99/Agentspec/apps/action@v0.1.0
        with:
          fail-below: "70"
```

## Inputs

| Name | Description | Default |
| --- | --- | --- |
| `config` | Path to `mdpact.config.*` (auto-discovered if omitted) | — |
| `fail-below` | Fail the check if score drops below this value | `70` |
| `run-behavior-tests` | Run the behavior-prediction engine (costs API credits) | `false` |
| `models` | Comma-separated subset of models to run | — |
| `budget-usd` | Hard USD ceiling for the behavior run | `1` |
| `comment` | Post sticky PR comment with results | `true` |
| `github-token` | Token for comment upsert | `${{ github.token }}` |

## Outputs

- `score` — numeric score (0–100)
- `errors` — count of error-severity diagnostics
- `warnings` — count of warning-severity diagnostics

## Behavior testing

Set `run-behavior-tests: "true"` and supply the relevant API keys as secrets:

```yaml
      - uses: HMAKT99/Agentspec/apps/action@v0.1.0
        with:
          run-behavior-tests: "true"
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
```

## What gets posted

A single sticky comment per PR, keyed by an invisible marker so repeated runs update in place rather than spamming. Includes the score (with delta vs the base branch), severity counts, and a collapsible list of diagnostics grouped by rule id.
