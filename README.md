# mdpact

> **The missing layer between your markdown and your agents.**

`mdpact` lints the markdown your agents read, so you stop shipping contradictions. Free, open-source, local-first.

## Quickest start — drop the Action into a PR check

```yaml
# .github/workflows/mdpact.yml
name: mdpact
on:
  pull_request:
    paths: ["CLAUDE.md", "AGENTS.md", "**/*.mcp.md"]

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
      - uses: HMAKT99/Agentspec/apps/action@v0.2.0
        with:
          fail-below: "70"
```

Posts a sticky PR comment with score + inline annotations. No install, no secrets needed for the default lint path.

## Local CLI — npm publish pending

Once the `@mdpact/*` packages ship to npm you'll be able to:

```bash
npm i -D @mdpact/cli
npx mdpact init
npx mdpact lint
```

Until then, clone this repo and run `pnpm install && pnpm --filter @mdpact/cli build` to use the binary from `packages/cli/bin/mdpact.mjs`.

## Why

Markdown became the lingua franca of agent instructions by accident. Every coding agent — Claude Code, GitHub Copilot, Cursor, Windsurf, Cline, Aider, Codex — reads markdown files as its runtime contract, and no tool exists to validate, test, or govern those files.

mdpact auto-discovers specs across the whole ecosystem:

| File | Agent(s) |
| --- | --- |
| `CLAUDE.md` | Claude Code |
| `AGENTS.md` | Codex, GitHub Copilot, Cursor, Claude Code (canonical open format, AAIF / Linux Foundation) |
| `.github/copilot-instructions.md` | GitHub Copilot (repo) |
| `.github/copilot-cli-instructions.md` | GitHub Copilot CLI |
| `**/*.agent.md` | VS Code Copilot custom agents |
| `.cursorrules` / `.cursor/rules/**/*.mdc` | Cursor |
| `.windsurfrules` | Windsurf |
| `.clinerules` | Cline |
| `.aider.md`, `.aider-instructions.md` | Aider |
| `GEMINI.md` | Google Gemini CLI |
| `**/*.mcp.md` | MCP tool specs |

Across all these formats the failure modes are the same:

- Two rules that contradict on the same page, with neither marked as the exception
- A tool referenced but never scoped — "use `gh`" without a when
- A destructive action ("deploy to prod") that happens to be binding but has no confirmation gate
- A binding rule sitting 6,000 tokens deep where models silently ignore it
- An API key pasted into the spec "temporarily"

`mdpact` catches all of these statically. Then optionally runs your spec against a model (or three) and reports how consistently each one follows the rules you wrote.

## What's in the box

- **Lint** — 18 built-in rules across conflict, clarity, tools, structure, tokens, and compliance. Each one has docs and auto-tested good/bad fixtures.
- **Score** — a single 0–100 number you can gate PRs against, with a transparent deduction table.
- **Fix** — safe-by-default auto-fixes; `--unsafe` for transformational rewrites.
- **Test** — behavior-prediction engine runs your spec against Anthropic / OpenAI / Google models, classifies each response (`refused` / `clarified` / `acted` / `deviated`), and reports per-model divergence. Hard USD budget guardrail.
- **Diff** — lint the spec at a git ref, compare against your working tree, surface introduced / fixed diagnostics.
- **CI** — GitHub Action posts a sticky PR comment with score delta, inline annotations, and fails the check on score regression.
- **Playground** — paste a spec into the in-browser lint at [hmakt99.github.io/Agentspec/playground](https://hmakt99.github.io/Agentspec/playground/). Nothing leaves your machine.

## 60-second tour

```bash
$ mdpact lint CLAUDE.md
CLAUDE.md
  13:1   error    Binding rules contradict: "You must always commit before pushing." vs "Never commit before pushing."   conflict/binding
  41:3   warning  "best practices" — link the specific doc.                                                               clarity/vague-directive
  58:1   warning  Binding rule sits past the attention threshold (~4000 tokens).                                          tokens/buried-rule

✖ 1 error, 2 warnings (14ms)
```

```bash
$ mdpact score CLAUDE.md
Score: 81/100

  base                100
  errors ×   1     -8
  warnings ×   2   -6
  info ×   0       0
  token budget       ok
  frontmatter        -5
```

```bash
$ mdpact explain conflict/binding
conflict/binding
category: conflict
severity: error
fixable:  no
docs:     https://hmakt99.github.io/Agentspec/rules/conflict/binding

Two binding directives directly contradict each other.
```

## Privacy

Your spec never leaves your machine unless you run `mdpact test`. That command calls the model APIs you declare. Cache keys are content hashes — no spec text is stored alongside the cache.

Everything else — `lint`, `score`, `fix`, `diff`, `explain`, `init` — runs entirely against local files.

## Packages

| Package | Role |
| --- | --- |
| [`@mdpact/cli`](./packages/cli) | The `mdpact` binary |
| [`@mdpact/core`](./packages/core) | Parser, rule runner, public types |
| [`@mdpact/rules`](./packages/rules) | Built-in rule catalog |
| [`@mdpact/config`](./packages/config) | Config loader (TS / JS / JSON / YAML) |
| [`@mdpact/engine`](./packages/engine) | Behavior-prediction engine + adapters |
| [`@mdpact/action`](./apps/action) | GitHub Action |
| [`@mdpact/web`](./apps/web) | [hmakt99.github.io/Agentspec](https://hmakt99.github.io/Agentspec/) |

## GitHub Action

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
- uses: HMAKT99/Agentspec/apps/action@v0.2.0
  with:
    fail-below: "70"
```

See the [Action docs](./apps/action/README.md) for the full input table and how to enable live behavior tests in CI.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). New rules are welcome — each one ships with `index.ts`, `docs.md`, and `fixtures/{good,bad}.md` that are automatically tested.

## License

MIT. See [LICENSE](./LICENSE).
