# @agentspec/web

The marketing + docs site. Next.js 15 App Router, Tailwind v4, statically prerendered.

## Develop

```bash
pnpm install
pnpm --filter @agentspec/web dev
```

Visit http://localhost:3000.

## Routes

- `/` — marketing landing
- `/docs/*` — reference docs (getting-started, cli, config, engine, action)
- `/rules` — public rule catalog (18 static pages)
- `/playground` — client-side lint (no network)

## Deploy (Vercel)

Set the project root to `apps/web` in the Vercel dashboard. The repo-root `vercel.json` handles the rest:

- `installCommand`: `cd ../.. && pnpm install --frozen-lockfile`
- `buildCommand`: `cd ../.. && pnpm turbo run build --filter=@agentspec/web`
- `outputDirectory`: `apps/web/.next`
- `framework`: `nextjs`

Every PR against `main` gets a preview URL. Production deploys fire on push to `main`.

## Update the rule catalog content

The rule pages are generated at build time from `@agentspec/rules` metadata + `docs.md` files under `packages/rules/src/<category>/<id>/`. No web-side action needed when new rules land — just rebuild.
