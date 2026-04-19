---
"mdpact": patch
---

Security posture: enable Dependabot.

- `.github/dependabot.yml` runs weekly dependency checks against npm + GitHub Actions, grouping related updates (`@types/*`, Biome, Next/React, vendor SDKs) so the PR queue stays manageable.

CodeQL deferred: the workflow runs cleanly but the upload step requires **Code scanning** to be enabled at the repo level (Settings → Code security → Code scanning → "Set up"). Once that's enabled, the CodeQL workflow can land in a follow-up PR.
