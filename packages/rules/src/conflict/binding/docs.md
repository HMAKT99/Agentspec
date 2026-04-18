# conflict/binding

**Severity:** error
**Category:** conflict
**Fixable:** no

## What it catches

Two binding directives in the same spec that directly contradict each other. Binding directives use language like `must`, `always`, `never`, or `do not` — they assert hard rules the agent is expected to follow. When two of them disagree on the same verb and object but with opposite polarity, the spec is internally inconsistent and any agent reading it will make an arbitrary choice.

## Why it matters

Contradictions inside agent instructions are the single most common source of surprising agent behavior. A spec that says both "always use tabs" and "never use tabs" isn't a style preference — it's undefined behavior. Different models will resolve the contradiction differently, and the same model will resolve it differently across runs. The fix is to pick one rule or restructure with an explicit exception clause.

## Example — bad

```markdown
- You must always commit before pushing.
- Never commit before pushing.
```

Both are binding, both target `commit before pushing`, polarity disagrees. The rule fires.

## Example — good

```markdown
- You must always commit before pushing.
- Unless the branch is a scratch branch, in which case pushing without a commit is fine.
```

The second directive uses an exception cue (`unless`), so the extractor classifies it as `exception`, not `binding`, and no conflict is reported.

## How to fix

Pick the rule you actually want, delete the other, or rewrite the weaker one as an explicit exception that names the condition under which it applies.
