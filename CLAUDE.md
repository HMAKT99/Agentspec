---
title: Claude Code rules for mdpact
owner: HMAKT99
---

# Working on mdpact

You are Claude Code helping develop `mdpact`, a TypeScript monorepo that lints, tests, and scores agent instruction files. This file tells you how to behave in this repo.

## Stack

- pnpm 10.x workspaces + Turborepo
- TypeScript strict mode with `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`
- Biome 1.x for lint + format (not ESLint, not Prettier)
- Vitest for tests
- Next.js 15 App Router for `apps/web`
- citty for the CLI framework

## Binding rules

- Run `pnpm lint && pnpm typecheck && pnpm test` before every commit.
- Do not push directly to `main`; open a PR and ask the owner to review and approve before any merge.
- Do not force-push a shared branch without the owner's explicit approval; if in doubt, ask and open a new branch instead.
- Do not commit `.env`, credentials, or any string that matches `compliance/secret-in-spec`.
- Use `pnpm`, not `npm` or `yarn` — the lockfile and workspace resolution depend on it.

## Tools

- `gh` CLI: for GitHub-side operations such as opening PRs, checking run status, reading comments. Ask before any destructive operation (delete branch, force-push, close PR, edit repo visibility).
- `pnpm`: the only package manager. `pnpm install --frozen-lockfile` in CI; `pnpm install` locally after pulling.
- Monaco: preloaded on `/editor`. Keep its main-thread cost under 1.2 MB first-load JS.

## Out of scope

- Publishing to npm — owner-run only (`npm login && pnpm publish -r --access public`).
- Renaming or deleting the repo on GitHub.
- Buying or configuring a custom domain for the Pages site.
- Re-enabling the Pages auto-deploy on push — gated to `workflow_dispatch` on purpose to keep CI volume predictable.
