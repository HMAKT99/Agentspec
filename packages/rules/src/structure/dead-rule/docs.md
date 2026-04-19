# structure/dead-rule

**Severity:** info
**Category:** structure
**Fixable:** no

## What it catches

A later advisory directive (`should`, `prefer`, `try to`) that targets the same verb + object + polarity as an earlier binding directive (`must`, `always`, `never`). The advisory can't meaningfully soften the binding — it's dead weight in the spec.

## Why it matters

Dead rules aren't harmless. They imply the binding is negotiable ("maybe the team didn't mean it?") and they add surface area a reader has to parse before finding the rule that actually governs. Kill the advisory or escalate it by rewriting the binding into a more nuanced form (e.g. with an explicit exception clause).

## Related

- `conflict/scope-overlap` catches the same signal at the pair level (two rules about the same topic with different strength). `structure/dead-rule` specifically calls out the *later* rule as the one to delete.

## Example — bad

```markdown
- You must always commit before pushing.
- You should also commit before pushing when you can.
```

## Example — good

```markdown
- You must always commit before pushing.
```

## Fix guidance

Delete the advisory. If you wanted the rule to be negotiable, rewrite the binding as an advisory — don't stack both.
