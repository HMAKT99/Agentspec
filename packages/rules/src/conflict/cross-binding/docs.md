# conflict/cross-binding

**Severity:** error
**Category:** conflict
**Fixable:** no

## What it catches

A binding directive in one spec file (e.g. `CLAUDE.md`) contradicts a binding directive in another spec file (e.g. `AGENTS.md` or an MCP tool spec). Same verb + object, opposite polarity.

## Why it matters

Real projects ship multiple spec files: `CLAUDE.md` for Claude Code, `AGENTS.md` for the OpenAI / Cursor workflow, MCP tool specs under `.mcp/`. Each was probably written by different people at different times, and they silently diverge. When the agent gets pointed at the wrong file — or when different tools read different files — you get inconsistent behavior across your own team.

This rule only fires on *binding* directives on both sides. Advisory wording gets its own softer rule later.

## Example — bad

```
CLAUDE.md:
  - You must always commit before pushing.

AGENTS.md:
  - Never commit before pushing.
```

Both files are authoritative for something. Neither mentions the other. The agent picks whichever one was loaded first.

## Example — good

Consolidate to a single source, or have one file reference the other:

```
CLAUDE.md:
  - Commit discipline lives in AGENTS.md §Commits. Follow that.

AGENTS.md:
  - You must always commit before pushing.
```

## Fix

Pick one spec as the source of truth. Delete the conflicting rule from the other file, or replace it with a pointer.
