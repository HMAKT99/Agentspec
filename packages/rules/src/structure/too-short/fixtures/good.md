---
version: 1
owner: platform-team
---

# Spec

This document governs agent behavior across the repository. Binding rules apply to any agent or developer touching the codebase, regardless of which file they are editing.

## Binding rules

- Always run the integration tests before merging changes to `main`.
- Never commit secrets, API keys, or anything matched by the `compliance/secret-in-spec` rule.
- Always request review from the codeowner before merging to protected branches.
- Never introduce breaking schema changes without a migration in the same PR.

## Advisory rules

- Prefer the existing utility helpers over writing new ones.
- Keep commit messages focused on the "why" rather than the "what".
