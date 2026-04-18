# Security Policy

## Supported versions

AgentSpec is pre-1.0. Only the latest release receives security fixes.

## Reporting a vulnerability

Do **not** open a public GitHub issue for security reports.

Email the maintainers at `security@agentspec.dev` (placeholder — will be wired up before v1.0 launch). Include:

- A description of the issue
- Steps to reproduce
- Impact assessment if known
- Your disclosure preferences

We aim to acknowledge reports within 3 business days and to coordinate a fix within 90 days. Credit will be given in the release notes unless you ask to remain anonymous.

## Scope

- The `agentspec` CLI and all `@agentspec/*` packages
- The AgentSpec GitHub Action (once shipped)
- The hosted website and docs (once shipped)

## Out of scope

- Behavior of third-party model APIs the engine calls
- Security of user-provided MCP servers referenced from a spec
