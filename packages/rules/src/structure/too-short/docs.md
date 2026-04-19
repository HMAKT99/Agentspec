# structure/too-short

**Severity:** warning
**Category:** structure
**Fixable:** no

## What it catches

Specs that are below a minimum token threshold (default: 50 tokens, ~200 characters). At that size there isn't room for even a single well-scoped directive plus context.

## Why it matters

A short spec either:

- Has been truncated or corrupted
- Is a stub that hasn't been filled in
- Is being linted by accident (e.g., a config file mislabeled as a spec)

Large, well-structured specs are where mdpact's other rules do their job. This rule flags the case where there isn't enough surface area for the rest of the catalog to say anything meaningful.

## Options

```ts
// mdpact.config.ts
export default {
  rules: {
    "structure/too-short": { minTokens: 50 },
  },
};
```

## Example — bad

```markdown
---
version: 1
---

# Spec

Be nice.
```

## Example — good

```markdown
---
version: 1
owner: platform-team
---

# Spec

This document governs agent behavior in the payments pipeline. Binding rules below apply to any agent touching `packages/payments`.

- Always run the integration tests before merging changes.
- Never introduce breaking schema changes without a migration in the same PR.
```
