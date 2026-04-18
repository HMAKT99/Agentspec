# Contributing

Thanks for your interest in AgentSpec. The project is in very early development; expect rough edges.

## Prerequisites

- Node 20+ (22 recommended)
- pnpm 10+

## Setup

```bash
pnpm install
pnpm build
pnpm test
```

## Workflow

1. Open an issue describing the change before starting non-trivial work.
2. Create a branch, commit small logical changes.
3. Add a changeset (`pnpm changeset`) for any user-visible change.
4. Open a PR against `main`. CI must be green.

## Rule authoring

Rules live in `packages/rules/src/<category>/<id>/`. Every rule ships with:

- `index.ts` — the rule implementation
- `docs.md` — human-readable rationale + examples
- `fixtures/good.md` and `fixtures/bad.md` — automatically tested

## Code style

Biome enforces formatting and basic lint. Run `pnpm format` before committing.

## Commit messages

Use imperative present tense. Reference the rule id or package in the subject line when relevant (`core: tighten sentence splitter`, `rules/conflict-binding: handle n-way conflicts`).
