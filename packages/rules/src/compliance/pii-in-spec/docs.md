# compliance/pii-in-spec

**Severity:** warning
**Category:** compliance
**Fixable:** no

## What it catches

Likely personally identifiable information in the spec itself — email addresses (except reserved `example.com` style domains), US SSNs, phone numbers, credit card shapes.

## Why it matters

Agent specs get copy-pasted, committed, and read by tools outside your control. PII that lives in a spec leaks by default. Use placeholders (`alice@example.com`, `+1-555-0100`) in examples, and keep real PII in a secrets vault if it's ever needed at runtime.

## Limitations

- Phone-number detection is noisy; it matches any 10–11 digit sequence with common separators.
- Credit card detection is lexical only — no Luhn check.
- This rule scans the raw spec text, so false positives are possible on UUIDs and structured identifiers. Use `rules: { "compliance/pii-in-spec": "off" }` to disable per repo.
