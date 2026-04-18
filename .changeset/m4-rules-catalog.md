---
"@agentspec/web": minor
---

Milestone 4 — part 2: `/rules` public catalog.

- `/rules` index lists every built-in rule grouped by category, with severity + fixability badges and a one-line description.
- `/rules/<category>/<id>` renders the rule's metadata plus its full `docs.md` (rendered via `remark-rehype`) and the good/bad fixtures side-by-side.
- All 18 rule pages are statically prerendered at build time via `generateStaticParams` so search engines can crawl them. Each page has SEO-ready title + description.
