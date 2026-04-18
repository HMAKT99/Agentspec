# clarity/pronoun-drift

**Severity:** info
**Category:** clarity
**Fixable:** no

## What it catches

A directive whose first word is a pronoun ("it", "this", "that", "they"). The antecedent lives outside the directive itself.

## Why it matters

Agents frequently read rules out of order or in isolation (e.g., when a specific section gets injected into context). A rule that begins "It should be reviewed by two people" only works if the reader knows what "it" is. Name the subject.

## Example — bad

```markdown
- It must be reviewed by two people before merge.
- They should run the test suite before deploying.
```

## Example — good

```markdown
- Security-sensitive diffs must be reviewed by two people before merge.
- Every deploy must run the full test suite first.
```
