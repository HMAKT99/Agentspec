# conflict/binding-exception

**Severity:** warning
**Category:** conflict
**Fixable:** no

## What it catches

A binding rule followed in the same section by an `unless` / `except` clause whose trigger is vague (`sometimes`, `depending on`, `as appropriate`, `usually`, `in most cases`, …). The binding rule looks binding but is quietly optional.

## Why it matters

The only thing worse than no rule is a rule the agent can evade whenever the condition "feels right." Vague exception triggers let the model decide when the binding applies — different models (and different runs of the same model) will draw the line in different places. Either name the exact condition, or drop the binding language.

## Example — bad

```markdown
- You must always commit before pushing.
- Unless sometimes the branch is a scratch branch, in which case pushing without a commit is fine.
```

The word `sometimes` gives the agent latitude to classify any branch as "scratch."

## Example — good

```markdown
- You must always commit before pushing.
- Unless the branch name starts with `scratch/`, in which case pushing without a commit is fine.
```

## Fix guidance

Replace the vague cue with a specific, observable trigger (a branch name prefix, a filename pattern, a repo label). If no specific trigger exists, delete the exception and accept that the binding is binding.
