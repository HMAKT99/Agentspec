# structure/no-sections

**Severity:** warning
**Category:** structure
**Fixable:** no

## What it catches

A spec longer than 200 lines (configurable) that has fewer than two H2 or deeper headings.

## Why it matters

Long unbroken prose is the hardest thing in the world to lint, review, or update. Without sections, rule scope becomes implicit ("this paragraph on line 247" rather than "the Tools section"), diffs become noisy, and agents have to hold more context to answer any one question. Sections give you cheap addressability.

## Options

- `minLines` (default `200`) — trigger threshold.
- `minHeadings` (default `2`) — minimum H2+ headings required.

## Example — good

A 300-line spec with `## Commits`, `## Style`, `## Tools`, `## Review`.

## Example — bad

A 300-line spec with one H1 and no sub-headings.
