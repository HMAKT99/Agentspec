import type { Rule, RuleResult } from "@mdpact/core";

const WHEN_CUES = [
  "when",
  "if",
  "whenever",
  "before",
  "after",
  "during",
  "while",
  "to",
  "for",
  "use ",
  "run ",
  "only ",
  "otherwise",
  "unless",
];

const DETECT = new Set([
  "git",
  "gh",
  "npm",
  "pnpm",
  "yarn",
  "docker",
  "kubectl",
  "aws",
  "gcloud",
  "terraform",
  "psql",
  "mysql",
  "redis-cli",
]);

export const missingWhen: Rule = {
  id: "tools/missing-when",
  severity: "info",
  description: "A tool is referenced without guidance on when to invoke it.",
  category: "tools",
  fixable: false,
  docsUrl: "https://mdpact.dev/rules/tools/missing-when",

  run(ctx): RuleResult[] {
    const out: RuleResult[] = [];
    for (const ref of ctx.spec.inlineCode) {
      const firstToken = ref.text.trim().split(/\s+/)[0]?.toLowerCase();
      if (!firstToken || !DETECT.has(firstToken)) continue;

      const surroundingLower = ref.surroundingText.toLowerCase();
      if (WHEN_CUES.some((cue) => surroundingLower.includes(cue))) continue;

      out.push({
        ruleId: "tools/missing-when",
        severity: "info",
        message: `\`${ref.text}\` appears without "when/if/before/after" guidance — tell the agent when to invoke it.`,
        range: ref.range,
        data: { tool: firstToken },
      });
    }
    return out;
  },
};
