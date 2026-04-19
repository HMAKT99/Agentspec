# X launch thread

**1/**
Your CLAUDE.md is probably broken.

Not syntactically — semantically. Rules that contradict. Destructive actions without gates. Tool policy that disagrees with itself. Binding rules buried past the attention threshold.

There was no linter for this. So we built one.

https://github.com/HMAKT99/Agentspec

**2/**
The wedge is a linter. 18 rules across conflict / clarity / tools / structure / tokens / compliance. Every rule has docs + auto-tested good/bad fixtures.

Run it locally: `npm i -D @mdpact/cli && npx mdpact lint`

**3/**
The moat is behavior prediction. Point mdpact at Anthropic / OpenAI / Google, run your spec against real tasks, and get per-model divergence back.

Hard USD budget guardrail. Results cached by content hash. Your spec never leaves your machine without opt-in.

**4/**
The long game is governance. Agent specs will be legal and compliance artefacts within a year. Shared rule catalogs, attestation bundles, runtime enforcement — all on the roadmap.

OSS linter is free forever. Hosted registry + compliance are paid. Fair deal.

**5/**
Try it in your browser — no signup, runs entirely client-side:

🔗 https://mdpact.dev/playground

Paste your CLAUDE.md. We think you'll be surprised.
