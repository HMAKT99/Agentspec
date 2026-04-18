# conflict/scope-overlap

**Severity:** warning
**Category:** conflict
**Fixable:** no

## What it catches

Two rules that target the same verb+object but disagree on strength — one is binding (`must`, `always`), the other advisory (`should`, `prefer`).

## Why it matters

When the same topic appears twice with different modal strength, the spec is effectively saying "this is mandatory, except also maybe not". Readers — and models — default to the weaker one, and the binding rule becomes aspirational. Pick one strength; if the rule genuinely has exceptions, use an explicit "unless..." clause.

## Example — bad

```markdown
- You must commit before pushing.
- You should commit before pushing.
```

## Example — good

```markdown
- You must commit before pushing.
```
