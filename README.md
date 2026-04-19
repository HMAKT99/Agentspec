# AgentSpec

> **The missing layer between your markdown and your agents.**

`agentspec` lints the markdown your agents read, so you stop shipping contradictions. Free, open-source, local-first.

```bash
npm i -D @agentspec/cli @agentspec/config
npx agentspec init
npx agentspec lint
```

## Why

Markdown became the lingua franca of agent instructions by accident. Every Claude Code, Cursor, and MCP user ends up with a `CLAUDE.md` / `AGENTS.md` / `.cursorrules` that defines agent behavior — and no tool exists to validate, test, or govern those files.

The result:

- Two rules that contradict on the same page, with neither marked as the exception
- A tool referenced but never scoped — "use `gh`" without a when
- A destructive action ("deploy to prod") that happens to be binding but has no confirmation gate
- A binding rule sitting 6,000 tokens deep where models silently ignore it
- An API key pasted into the spec "temporarily"

`agentspec` catches all of these statically. Then optionally runs your spec against a model (or three) and reports how consistently each one follows the rules you wrote.

## What's in the box

- **Lint** — 18 built-in rules across conflict, clarity, tools, structure, tokens, and compliance. Each one has docs and auto-tested good/bad fixtures.
- **Score** — a single 0–100 number you can gate PRs against, with a transparent deduction table.
- **Fix** — safe-by-default auto-fixes; `--unsafe` for transformational rewrites.
- **Test** — behavior-prediction engine runs your spec against Anthropic / OpenAI / Google models, classifies each response (`refused` / `clarified` / `acted` / `deviated`), and reports per-model divergence. Hard USD budget guardrail.
- **Diff** — lint the spec at a git ref, compare against your working tree, surface introduced / fixed diagnostics.
- **CI** — GitHub Action posts a sticky PR comment with score delta, inline annotations, and fails the check on score regression.
- **Playground** — paste a spec into the in-browser lint at [agentspec.dev/playground](https://agentspec.dev/playground). Nothing leaves your machine.

## 60-second tour

```bash
$ agentspec lint CLAUDE.md
CLAUDE.md
  13:1   error    Binding rules contradict: "You must always commit before pushing." vs "Never commit before pushing."   conflict/binding
  41:3   warning  "best practices" — link the specific doc.                                                               clarity/vague-directive
  58:1   warning  Binding rule sits past the attention threshold (~4000 tokens).                                          tokens/buried-rule

✖ 1 error, 2 warnings (14ms)
```

```bash
$ agentspec score CLAUDE.md
Score: 81/100

  base                100
  errors ×   1     -8
  warnings ×   2   -6
  info ×   0       0
  token budget       ok
  frontmatter        -5
```

```bash
$ agentspec explain conflict/binding
conflict/binding
category: conflict
severity: error
fixable:  no
docs:     https://agentspec.dev/rules/conflict/binding

Two binding directives directly contradict each other.
```

## Privacy

Your spec never leaves your machine unless you run `agentspec test`. That command calls the model APIs you declare. Cache keys are content hashes — no spec text is stored alongside the cache.

Everything else — `lint`, `score`, `fix`, `diff`, `explain`, `init` — runs entirely against local files.

## Packages

| Package | Role |
| --- | --- |
| [`@agentspec/cli`](./packages/cli) | The `agentspec` binary |
| [`@agentspec/core`](./packages/core) | Parser, rule runner, public types |
| [`@agentspec/rules`](./packages/rules) | Built-in rule catalog |
| [`@agentspec/config`](./packages/config) | Config loader (TS / JS / JSON / YAML) |
| [`@agentspec/engine`](./packages/engine) | Behavior-prediction engine + adapters |
| [`@agentspec/action`](./apps/action) | GitHub Action |
| [`@agentspec/web`](./apps/web) | [agentspec.dev](https://agentspec.dev) |

## GitHub Action

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
- uses: HMAKT99/Agentspec@main
  with:
    fail-below: "70"
```

See the [Action docs](./apps/action/README.md) for the full input table and how to enable live behavior tests in CI.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). New rules are welcome — each one ships with `index.ts`, `docs.md`, and `fixtures/{good,bad}.md` that are automatically tested.

## License

MIT. See [LICENSE](./LICENSE).
