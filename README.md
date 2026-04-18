# AgentSpec

> **Status:** Milestone 0 — scaffolding only. APIs are unstable. Do not depend on anything yet.

AgentSpec lints, tests, and scores agent instruction files (CLAUDE.md, AGENTS.md, MCP tool specs, system prompts) so you stop shipping contradictions to your agents.

## Packages

| Package | Description |
| --- | --- |
| `@agentspec/core` | Parser, rule runner, and shared types |
| `@agentspec/rules` | Built-in rule catalog |
| `@agentspec/cli` | The `agentspec` binary |

## Quick start (local dev)

```bash
pnpm install
pnpm build
node packages/cli/bin/agentspec.mjs lint examples/bad-claude.md
```

## Roadmap

See the milestone plan in the repo. v1 targets: full lint catalog, behavior prediction engine, GitHub Action, docs site, in-browser playground.

## License

MIT
