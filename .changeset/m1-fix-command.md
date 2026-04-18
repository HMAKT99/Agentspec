---
"@agentspec/core": minor
"@agentspec/rules": patch
"@agentspec/cli": minor
---

Milestone 1 — part 3: `agentspec fix`.

- `@agentspec/core` exports `applyFixes(raw, fixes) → { text, applied, skipped }`. Handles sorted non-overlapping text edits, skips fixes without byte offsets or that overlap earlier applied edits.
- Rules can now implement `fix(ctx, result) → Fix | null`. The first implementation is `structure/no-frontmatter` (marked `"unsafe"`), which inserts a placeholder frontmatter block at offset 0.
- New `agentspec fix` command with `--unsafe`, `--dry-run`, and config-aware spec discovery. Skips overlapping fixes with a warning instead of silently corrupting output.
