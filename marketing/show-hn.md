# Show HN copy

## Title

Show HN: AgentSpec – Lint, test, and score your CLAUDE.md / AGENTS.md

## Body

Hi HN,

Every Claude Code, Cursor, and MCP user ends up with a markdown file that defines agent behavior — CLAUDE.md, AGENTS.md, .cursorrules. There's no tool to validate, test, or govern these files. They're contracts with the agent, but they're just plain prose nobody checks.

We looked at a bunch of real specs and kept seeing the same failure modes: binding rules that contradict, destructive actions without a confirmation gate, tool policy that disagrees with itself across sections, binding rules buried deep where models stop paying attention, secrets pasted in "temporarily".

AgentSpec lints for all of that statically. Then — optionally — runs your spec across Anthropic / OpenAI / Google models, classifies each response, and reports how consistently each model follows what you wrote.

- Repo: https://github.com/HMAKT99/Agentspec
- Playground (no signup, runs in your browser): https://agentspec.dev/playground
- Docs: https://agentspec.dev/docs
- Rule catalog: https://agentspec.dev/rules

Happy to answer questions about the architecture (TypeScript monorepo, unified + remark for parsing, three vendor SDKs for the engine, cost-bounded cache), the rule heuristics, or why we chose to make the CLI strictly local-first.

MIT, free forever for the OSS surface. Hosted registry + enterprise features come later and are paid.
