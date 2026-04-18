---
"@agentspec/web": minor
---

Milestone 4 — part 3: `/playground`.

- New client-side playground: paste a spec on the left, see diagnostics render live on the right.
- Runs the full lint pipeline (`@agentspec/core` + every built-in rule from `@agentspec/rules`) directly in the browser; no network calls, no uploads.
- Score panel uses the same scoring deductions as `agentspec score` (errors −8, warnings −3, info −1, floored at 0).
- Share URL: base64-encodes the current spec into `?spec=…` and copies the link to clipboard.
- Spec is also auto-persisted to `localStorage` so the page survives reloads.
