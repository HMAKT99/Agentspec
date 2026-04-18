# compliance/secret-in-spec

**Severity:** error
**Category:** compliance
**Fixable:** no

## What it catches

Shapes that look like live API keys or private keys pasted into the spec: OpenAI `sk-...`, Anthropic `sk-ant-...`, AWS `AKIA...`, GitHub `ghp_/gho_...`, Slack `xox[abpros]-...`, `-----BEGIN ... PRIVATE KEY-----` blocks.

## Why it matters

Any of these in the spec is a live incident. If it matches, treat it as compromised and rotate — the rule only catches patterns, it can't tell you whether the key is current or a stale placeholder. Either way, get it out of git history.

## Fix

1. Rotate the credential at the issuer.
2. Replace the spec text with an environment-variable reference (e.g. `ANTHROPIC_API_KEY`).
3. Scrub git history (`git filter-repo` or equivalent) if the secret has been committed.
