# structure/duplicate-heading

**Severity:** warning
**Category:** structure
**Fixable:** no

## What it catches

Two headings with the same text (case-insensitive) in the same spec.

## Why it matters

When a section heading is ambiguous, the rules beneath it are ambiguous by extension. Readers — human and agent — can't tell which "## Style" section you meant when a later rule says "as noted above under Style". It also hints that the file has grown without a re-org and probably has other duplication below.

## Example — bad

```markdown
## Style

Prefer tabs.

## Style

Use two-space indent in YAML.
```

## Example — good

```markdown
## Style (TypeScript)

Prefer tabs.

## Style (YAML)

Use two-space indent.
```
