# @mdpact/rules

## 0.2.0

### Added

- **`structure/empty-spec`** (severity: error) — fires when a spec contains
  zero binding, advisory, or exception directives. Triggers a score cap at
  40/100 so gibberish and unfilled templates can never pass a
  `fail-below: 70` gate. Score-cap wiring lives in `@mdpact/cli` and in the
  web playground/editor.
- **`structure/too-short`** (severity: warning, configurable `minTokens=50`)
  — fires when the spec is below a minimum token threshold. Catches stub
  files, truncated files, and accidental non-specs.

### Changed

- Catalog size: 20 → 22 rules.

## 0.1.0 — initial release

First public release. See the root README for the feature list and usage.
