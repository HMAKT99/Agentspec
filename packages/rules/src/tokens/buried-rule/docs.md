# tokens/buried-rule

**Severity:** warning
**Category:** tokens
**Fixable:** no

## What it catches

A binding rule (uses `must`, `always`, `never`, etc.) whose position in the file is past the configured attention threshold (default ~4,000 tokens).

## Why it matters

Long specs have non-uniform attention. Binding rules at the top of the file are the most reliably followed; rules 6,000 tokens in are the ones that models quietly ignore. If a rule is binding, it should be near the top — or the spec needs surgery.

## Options

- `attentionTokens` (default `4000`) — position below which a binding rule is considered buried.

## Fix guidance

Move the rule closer to the top, split the spec into smaller files, or downgrade the rule from binding to advisory if it genuinely doesn't need to win every time.
