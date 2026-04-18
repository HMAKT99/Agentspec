# clarity/vague-directive

**Severity:** warning
**Category:** clarity
**Fixable:** no

## What it catches

Rules that defer to unnamed authority — "follow our standards", "best practices", "team conventions" — with no link or specific document to read.

## Why it matters

"Best practices" isn't a rule, it's a dodge. The agent can't look up what "our standards" means. Worse, different readers assume different things, so the rule ends up meaning whatever they already wanted to do. Either link to the doc that actually defines the standard, or rewrite the rule to say the thing directly.

## Example — bad

```markdown
- Follow our standards when writing tests.
```

## Example — good

```markdown
- Follow [our test-writing guide](docs/testing.md).
- Or directly: every PR must add a test that fails before the fix and passes after.
```
