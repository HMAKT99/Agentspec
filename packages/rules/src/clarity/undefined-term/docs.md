# clarity/undefined-term

**Severity:** info
**Category:** clarity
**Fixable:** no

## What it catches

An uncommon ALL-CAPS acronym (≥3 letters) that appears exactly once in the spec and isn't on the built-in list of common tech acronyms. Likely organization-specific jargon — SLAP, CRAP, OASIS — that readers can't decode.

## Why it matters

Jargon is a load-bearing footgun: the writer knows what it means, the reader has to guess. When the reader is an agent, the guess will be confidently wrong. Either spell the term out on first use, or add a glossary section.

## Limitations

The heuristic is deliberately conservative — only fires on terms that aren't on a known-good list and appear exactly once. Multi-word proper nouns and mixed-case jargon are not yet detected (tracked for M2).
