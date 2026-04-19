---
"@mdpact/cli": minor
"@mdpact/web": minor
---

End-to-end CLI integration tests + GitHub Pages deployment.

### Integration tests (`@mdpact/cli`)

New vitest suite at `packages/cli/src/__tests__/integration.test.ts` that spawns the compiled `mdpact` binary via `execFile` against real temp-dir fixtures. 16 tests covering:

- `lint` — clean spec, contradicting spec, JSON output shape, GitHub annotation format, cross-file conflict detection via glob input
- `score` — 100 on clean, 92 on one-error spec, `--threshold` exit-code semantics
- `explain` — known rule metadata, unknown rule error path
- `init` — config scaffolding, `.gitignore` update, `--force` overwrite behavior
- `fix` — safe vs `--unsafe` gating, `--dry-run` doesn't touch files
- `--help` exit code (output assertion dropped; citty calls `process.exit(0)` sync before stdout flushes to parent pipe in vitest's worker-spawn context)

Total CLI tests: 13 → 29.

### GitHub Pages (`@mdpact/web`)

- `next.config.mjs` gains `output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`, and optional `basePath` from `BASE_PATH` env var (unset locally, set by the workflow to `/<repo-name>`).
- New workflow `.github/workflows/pages.yml` triggers on pushes to `main` that touch the web app or its deps, builds the static export, uploads it as a Pages artifact, and deploys.
- `turbo.json` picks up `BASE_PATH` as a cache-influencing env var and adds `out/**` to build outputs.
- `biome.json` ignores `out` and `apps/web/out` so lint doesn't descend into the 1600+ exported static files.

Cost: $0/month. Bandwidth is covered by Pages. Site will publish at `https://<user>.github.io/<repo>/`.
