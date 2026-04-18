# tools/unknown-tool

**Severity:** warning
**Category:** tools
**Fixable:** no

## What it catches

A backticked command (e.g. `` `docker push` ``) that matches the rule's detection list but isn't in the project's `allowed` list. Default: detects common CLIs, flags any not explicitly allowed.

## Why it matters

A rule that says "use `docker push`" assumes the agent has Docker available and has policy to run it. If Docker isn't part of the declared toolset, the agent will either refuse at the wrong moment or — worse — succeed in a way that wasn't approved. Declare the tools you want the agent to use.

## Options

- `allowed` (default `[]`) — the tool names the agent is permitted to use.
- `detect` (default common CLIs) — tokens that should be matched against `allowed`. Narrow this if you want the rule to fire on a smaller set.

## Example — bad (default detect list, empty allowed)

```markdown
- Run `docker push` to publish the image.
```

## Example — good

```markdown
- Run `gh pr create` to open the PR.
```

with `ruleOptions: { "tools/unknown-tool": { allowed: ["gh"] } }` in your config.
