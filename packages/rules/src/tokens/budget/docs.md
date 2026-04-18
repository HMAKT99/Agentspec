# tokens/budget

**Severity:** warning
**Category:** tokens
**Fixable:** no

## What it catches

A spec whose approximate token count exceeds the configured budget (default 10,000 tokens).

## Why it matters

Every token in the spec is a token the agent has to hold in context on every call. Past a few thousand tokens, attention gets uneven and later rules start getting ignored (see `tokens/buried-rule`). A budget forces discipline: if the spec keeps growing, split it or cut.

## Options

- `max` (default `10000`) — token ceiling before the rule fires.

The counter is a 4-chars-per-token approximation. A per-model tokenizer lands with the behavior engine.
