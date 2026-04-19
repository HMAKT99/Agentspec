import type { Rule, RuleResult } from "@mdpact/core";

const SENSITIVE_VERBS = [
  "deploy",
  "release",
  "publish",
  "merge",
  "push",
  "send",
  "email",
  "post",
  "charge",
  "refund",
  "transfer",
  "disable",
  "enable",
  "invite",
  "revoke",
];

const HUMAN_CUES = [
  "human",
  "approval",
  "approved",
  "approve",
  "confirm",
  "review",
  "reviewer",
  "sign-off",
  "sign off",
  "ask",
  "two people",
  "oncall",
  "on-call",
];

export const missingHumanGate: Rule = {
  id: "compliance/missing-human-gate",
  severity: "warning",
  description: "A binding rule permits a high-impact action without requiring a human in the loop.",
  category: "compliance",
  fixable: false,
  docsUrl: "https://mdpact.dev/rules/compliance/missing-human-gate",

  run(ctx): RuleResult[] {
    const out: RuleResult[] = [];
    for (const rule of ctx.spec.extractedRules) {
      if (rule.kind !== "binding") continue;
      const lower = rule.text.toLowerCase();

      const verb = SENSITIVE_VERBS.find((v) => containsWord(lower, v));
      if (!verb) continue;
      if (HUMAN_CUES.some((c) => lower.includes(c))) continue;

      out.push({
        ruleId: "compliance/missing-human-gate",
        severity: "warning",
        message: `Binding rule allows "${verb}" without a human-in-the-loop cue — add explicit approval or reviewer language.`,
        range: rule.range,
        data: { verb },
      });
    }
    return out;
  },
};

function containsWord(haystack: string, needle: string): boolean {
  const pattern = new RegExp(`(?:^|\\W)${escapeRegex(needle)}(?:\\W|$)`, "i");
  return pattern.test(haystack);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
