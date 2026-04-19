# conflict/cross-tool-policy

**Severity:** warning
**Category:** conflict
**Fixable:** no

## What it catches

A backticked tool reference that appears with allow-cues (`use`, `run`, `prefer`) in one spec file and restrict-cues (`never`, `don't`, `forbidden`) in another.

## Why it matters

Teams accumulate spec files: `CLAUDE.md`, `AGENTS.md`, per-MCP-server tool specs. It's easy to add `docker push` to one file ("use it for local dev") and "never run `docker` in production" to another — without either file knowing the other exists. The agent picks whichever was loaded most recently or most vividly.

## Example — bad

```
CLAUDE.md:
  ## Local dev
  - Use `docker push` when testing locally.

AGENTS.md:
  ## Production
  - Never run `docker` in production.
```

## Example — good

```
AGENTS.md:
  ## Docker policy
  - You may run `docker push` for local dev only.
  - Production deploys go through `gh release`.

CLAUDE.md:
  - See AGENTS.md §Docker policy.
```

## Related

- `conflict/tool-policy` catches the same signal *within* a single file.
- `conflict/cross-binding` handles binding rules that conflict across files without specifically naming a tool.
