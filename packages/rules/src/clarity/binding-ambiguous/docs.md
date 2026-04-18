# clarity/binding-ambiguous

**Severity:** warning
**Category:** clarity
**Fixable:** no

## What it catches

A single directive that uses both binding modal language ("must", "always", "never") and advisory language ("try to", "should", "when possible", "consider") in the same sentence.

## Why it matters

Mixing modals creates permission ambiguity. "Try to always commit before pushing" reads as either "commit before pushing is mandatory" or "aim for commit-before-push but it's OK to skip sometimes" — different agents resolve it differently, and the same agent will resolve it differently on different runs. Pick one.

## Example — bad

```markdown
- Try to always commit before pushing.
- You must, when possible, review security diffs with two people.
```

## Example — good

```markdown
- You must commit before pushing.
- Prefer two reviewers on security-sensitive diffs.
```
