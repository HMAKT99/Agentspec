# conflict/tool-policy

**Severity:** warning
**Category:** conflict
**Fixable:** no

## What it catches

A backticked tool that appears near *allow* cues ("use", "run", "prefer") in one paragraph and near *restrict* cues ("never", "don't", "forbidden") in another.

## Why it matters

Tool policy ambiguity is one of the highest-impact spec bugs. If a rule in section A says "use `docker push`" and a rule in section B says "never run Docker in production", the agent will do whichever section it last saw most vividly. Consolidate the policy.

## Example — bad

```markdown
## Local dev

- Use `docker push` when testing locally.

## Production

- Never run `docker` in production.
```

## Example — good

```markdown
## Docker policy

- You may run `docker push` for local dev only.
- Production deploys go through `gh release`, never `docker push`.
```
