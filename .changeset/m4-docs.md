---
"@agentspec/web": minor
---

Milestone 4 — part 4: `/docs`.

- Shared docs layout with sticky sidebar navigation and breadcrumbs.
- Five static reference pages: Getting started, CLI reference, Configuration, Behavior engine, GitHub Action.
- Content is piped through the same `remark-rehype` renderer as the rule pages so the look is consistent.
- All pages statically prerendered at build time. `/docs` redirects to `/docs/getting-started`.

Defers: Fumadocs-powered MDX + search; current setup is intentionally lightweight and can be replaced later without changing URLs.
