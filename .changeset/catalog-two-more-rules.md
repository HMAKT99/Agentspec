---
"@mdpact/rules": minor
---

Catalog expansion: the two rules from spec §6 that were deferred in M1.

- `conflict/binding-exception` (warning) — flags a binding rule immediately followed by an exception whose trigger is vague (`sometimes`, `depending on`, `usually`, `as appropriate`, …). Uses the existing `BindingKind === "exception"` classifier output.
- `structure/dead-rule` (info) — flags a later advisory directive (`should`, `prefer`) whose verb + object + polarity is already mandated by an earlier binding. The advisory can't take effect and only adds noise.

Brings the rule count to 20 and closes the spec §20 "at least 20 rules passing fixture tests" criterion.
