# tools/destructive-no-confirm

**Severity:** error
**Category:** tools
**Fixable:** no

## What it catches

A directive that names a destructive verb (`delete`, `drop`, `deploy`, `release`, `send`, `purge`, `reset`, etc.) without any confirmation / human-gate language ("confirm", "ask", "review", "approval", "dry run") nearby.

## Why it matters

Agents will execute tool calls when the rule says to. A spec that says "delete the staging bucket every Monday" with no confirmation language will do exactly that — and any misclassification of a task as Monday-shaped costs you a bucket. Destructive operations should always have an explicit gate in the spec, so the agent has an unambiguous place to stop and ask.

## Example — bad

```markdown
- Delete expired users nightly.
```

## Example — good

```markdown
- Delete expired users nightly — but first, dry-run the query and ask for approval in #ops.
```
