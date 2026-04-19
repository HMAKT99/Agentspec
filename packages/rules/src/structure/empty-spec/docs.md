# structure/empty-spec

**Severity:** error
**Category:** structure
**Fixable:** no

## What it catches

A spec file that has zero directives — no binding rules ("must", "always", "never"), no advisory rules ("should", "prefer"), no exceptions ("unless", "except"). The file parses as valid markdown but has nothing that an agent can act on.

## Why it matters

The entire point of an agent spec is to shape agent behavior. A spec with no directives is either:

- Not actually a spec (someone pointed mdpact at the wrong file)
- An empty template that hasn't been filled in yet
- A document that describes context but doesn't issue instructions

In all three cases, the score should reflect that the file isn't a functional spec. This rule also triggers a score cap — when `empty-spec` fires, the overall score is capped at 40, regardless of other deductions. Gibberish, stub files, and unfilled templates will not pass a typical `fail-below: 70` gate.

## Example — bad

```markdown
Some random notes about the project.

More prose.
```

## Example — good

```markdown
---
version: 1
owner: platform-team
---

# Spec

- Always run tests before merging.
- Never commit secrets.
```
