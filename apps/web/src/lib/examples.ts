export interface Example {
  slug: string;
  title: string;
  ruleId: string;
  severity: "error" | "warning" | "info" | "clean";
  summary: string;
  explanation: string;
  markdown: string;
}

export const EXAMPLES: Example[] = [
  {
    slug: "conflict-binding",
    title: "Two rules contradict",
    ruleId: "conflict/binding",
    severity: "error",
    summary: "Same verb + object, opposite polarity. Both binding.",
    explanation:
      "Both sentences use binding language and target the same verb + object with opposite polarity. Different models (and different runs of the same model) resolve this contradiction differently. Fix: pick one, or rewrite the weaker one as an explicit `unless…` exception.",
    markdown: `---
version: 1
owner: platform-team
---

# CLAUDE.md

## Commit discipline

- You must always commit before pushing.
- Never commit before pushing.
`,
  },
  {
    slug: "tool-policy",
    title: "A tool is both allowed and banned",
    ruleId: "conflict/tool-policy",
    severity: "warning",
    summary: "Same tool has allow cues in one section, restrict cues in another.",
    explanation:
      '`docker` appears with allow language ("use") in one section and restrict language ("never run") in another. The agent will pick whichever section it last saw most vividly. Consolidate tool policy into one section that explicitly names the permitted contexts.',
    markdown: `---
version: 1
owner: platform-team
---

# CLAUDE.md

## Local dev

- Use \`docker push\` when testing locally.

## Production

- Never run \`docker\` in production.
`,
  },
  {
    slug: "destructive-no-confirm",
    title: "Destructive verb, no human gate",
    ruleId: "tools/destructive-no-confirm",
    severity: "error",
    summary: "`delete` / `deploy` / `rm` in a binding rule without a confirmation cue.",
    explanation:
      'A binding rule names a destructive verb (`delete`) with no surrounding confirmation language — no `confirm`, `approval`, `review`, `dry run`, or human cue. The agent will happily run this unattended. Add an explicit gate, like "…after getting approval from the oncall engineer."',
    markdown: `---
version: 1
owner: platform-team
---

# CLAUDE.md

## Cleanup

- Always delete expired users nightly.
`,
  },
  {
    slug: "vague-directive",
    title: '"Follow our standards"',
    ruleId: "clarity/vague-directive",
    severity: "warning",
    summary: "Appeal to unnamed authority with no link or concrete statement.",
    explanation:
      '"Our standards" and "best practices" point at authority the reader can\'t resolve. The agent can\'t look them up; neither can most humans. Fix: link the actual doc, or rewrite the rule to state the thing directly.',
    markdown: `---
version: 1
owner: platform-team
---

# CLAUDE.md

- Always follow our standards when writing tests.
- You must follow best practices for security.
`,
  },
  {
    slug: "secret-in-spec",
    title: "Real-shaped API key in the spec",
    ruleId: "compliance/secret-in-spec",
    severity: "error",
    summary: "Pattern match on OpenAI / Anthropic / GitHub / AWS / Slack key shapes.",
    explanation:
      "Any live-shaped credential in the spec is a potential incident. The rule doesn't verify if the key is real — it pattern-matches common formats. Treat matches as compromised: rotate the credential, scrub git history, replace with an environment-variable reference.",
    markdown: `---
version: 1
owner: platform-team
---

# CLAUDE.md

Authenticate with sk-ant-FAKE000000000000000000000000 when calling the API.
`,
  },
  {
    slug: "no-frontmatter",
    title: "No frontmatter",
    ruleId: "structure/no-frontmatter",
    severity: "warning",
    summary: "Missing version + owner metadata.",
    explanation:
      'Without frontmatter you can\'t answer "who owns this file?" or "which revision is the agent running against?" from the file alone. Easiest single fix: drop in a `version` and `owner` key at the top.',
    markdown: `# CLAUDE.md

- You must always commit before pushing.
`,
  },
  {
    slug: "binding-ambiguous",
    title: "Mixed modal language",
    ruleId: "clarity/binding-ambiguous",
    severity: "warning",
    summary: '"You must try to…" — binding + advisory in the same sentence.',
    explanation:
      '"Must try to" is a permission paradox. Is this mandatory or aspirational? Different models will resolve it differently. Pick one — either "You must commit before pushing" or "You should prefer committing before pushing" — don\'t stack both.',
    markdown: `---
version: 1
owner: platform-team
---

# CLAUDE.md

- You must try to commit before pushing.
`,
  },
  {
    slug: "clean",
    title: "A clean spec",
    ruleId: "",
    severity: "clean",
    summary: "Frontmatter set, rules unambiguous, tool has a `when` trigger.",
    explanation:
      "Nothing fires. Score hits 100/100. Notice how the tool reference is bracketed by a `when` clause so the agent knows the exact context in which to reach for it — that's what silences `tools/missing-when` and makes the rule auditable.",
    markdown: `---
version: 1
owner: platform-team
---

# CLAUDE.md

- You must always commit before pushing.
- Prefer TypeScript over plain JS for new packages.
- When opening a PR, use \`gh pr create\` with a descriptive title.
`,
  },
];

export function getExample(slug: string): Example | null {
  return EXAMPLES.find((e) => e.slug === slug) ?? null;
}
