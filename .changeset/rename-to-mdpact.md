---
"@mdpact/core": major
"@mdpact/rules": major
"@mdpact/engine": major
"@mdpact/config": major
"@mdpact/cli": major
"@mdpact/web": major
---

Rename: the project is now `mdpact`.

The previous `@agentspec/*` scope was already claimed on npm by an unrelated publisher, so the codebase shipped under `@agentspec/*` as a placeholder while we picked a final name. This change renames:

- npm scope: `@agentspec/*` → `@mdpact/*`
- CLI binary: `agentspec` → `mdpact` (file at `packages/cli/bin/agentspec.mjs` moved to `packages/cli/bin/mdpact.mjs`)
- product brand in prose/docs/marketing: `AgentSpec` / `Agentspec` / `agentspec` → `mdpact`
- documentation domain: `agentspec.dev` → `mdpact.dev`
- example workflow filename: `examples/workflows/agentspec.yml` → `examples/workflows/mdpact.yml`
- TypeScript PascalCase identifiers: `AgentSpecConfig` → `MdpactConfig`, etc.

Intentionally preserved:

- `github.com/HMAKT99/Agentspec` URLs — the GitHub repository itself still lives at that path; those references can be updated when the repo is renamed on GitHub.
- Historical changesets' internal package-name references were rewritten (not yet published, so no breaking-change semantics apply to consumers).

This is formally a major change for every package because any in-flight consumer using a workspace `@agentspec/*` dep will break — but none exist in practice, since nothing ever shipped to npm.
