# structure/no-frontmatter

**Severity:** warning
**Category:** structure
**Fixable:** no

## What it catches

Specs without any YAML frontmatter. At minimum you want `version` (so readers can tell which revision an agent is running against) and `owner` (so there's someone to ping when a rule is ambiguous).

## Why it matters

Frontmatter is the cheapest form of provenance. Without it, you can't answer "who owns this file?" or "did the agent get the latest version?" from the file alone. You'll end up reverse-engineering it from git blame, which is a lot of work to reconstitute in an incident.

## Example — bad

```markdown
# CLAUDE.md

Always commit before pushing.
```

## Example — good

```markdown
---
version: 3
owner: platform-team
scope: monorepo
---

# CLAUDE.md

Always commit before pushing.
```
