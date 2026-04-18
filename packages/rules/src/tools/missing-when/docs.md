# tools/missing-when

**Severity:** info
**Category:** tools
**Fixable:** no

## What it catches

A backticked tool command that appears without any conditional language ("when", "if", "before", "after", "only...", "use X to...") in its paragraph.

## Why it matters

Agents use tools when they think the tool is applicable. If your spec mentions a tool but never says *when* to reach for it, the agent will reach for it whenever the name fits — often overconfidently. Explicit `when` makes the rule auditable.

## Example — bad

```markdown
- The team uses `gh pr create`.
```

## Example — good

```markdown
- When opening a pull request from the CLI, use `gh pr create`.
```
