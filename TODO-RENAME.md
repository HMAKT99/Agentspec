# Rename checklist

`@agentspec/cli` is already published on npm by an unrelated owner. This repo uses `@agentspec/*` as a placeholder; every item below must be updated before the first public npm publish.

## Files that reference the package name

- [ ] `package.json` (root) — `name` field
- [ ] `packages/core/package.json` — `name`, `exports`
- [ ] `packages/rules/package.json` — `name`, dependency on `@agentspec/core`
- [ ] `packages/cli/package.json` — `name`, `bin` key, dependency on `@agentspec/core` + `@agentspec/rules`
- [ ] `packages/cli/src/main.ts` — `meta.name` and description
- [ ] `packages/cli/bin/agentspec.mjs` — rename the binary if the brand changes
- [ ] `packages/rules/src/conflict/binding/index.ts` — `docsUrl` points at `agentspec.dev/rules/...`
- [ ] `README.md` (root and every package)
- [ ] `CONTRIBUTING.md` — any references to `agentspec` as the name
- [ ] `SECURITY.md` — `security@agentspec.dev` placeholder email
- [ ] `.github/workflows/*` — any job names referencing `agentspec`
- [ ] `biome.json` — no references expected, double-check after rename
- [ ] `turbo.json` — no references expected, double-check after rename
- [ ] Future: `apps/web/**` — every URL, domain, brand reference
- [ ] Future: `apps/action/action.yml` — `name`, `description`, branding

## How to execute the rename

1. Decide the final name and npm scope.
2. Run a global find-replace against `@agentspec/` and `agentspec` (case-sensitive each way). Review every hit — not every match should change (e.g., historical references in changelogs).
3. Regenerate lockfile: `rm pnpm-lock.yaml && pnpm install`.
4. Run full CI locally: `pnpm lint && pnpm typecheck && pnpm build && pnpm test`.
5. Delete this file.
