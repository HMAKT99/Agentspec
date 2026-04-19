import type { Rule, RuleResult } from "@mdpact/core";

const BINDING_WORDS = ["always", "never", "must", "must not", "mustn't", "required", "shall"];
const ADVISORY_WORDS = [
  "try to",
  "consider",
  "when possible",
  "if possible",
  "should",
  "should not",
  "shouldn't",
  "prefer",
];

export const bindingAmbiguous: Rule = {
  id: "clarity/binding-ambiguous",
  severity: "warning",
  description: "A single directive mixes binding and advisory language, leaving intent unclear.",
  category: "clarity",
  fixable: false,
  docsUrl: "https://mdpact.dev/rules/clarity/binding-ambiguous",

  run(ctx): RuleResult[] {
    const out: RuleResult[] = [];
    for (const rule of ctx.spec.extractedRules) {
      if (rule.kind === "informational") continue;
      const lower = rule.text.toLowerCase();

      const binding = BINDING_WORDS.find((w) => containsWord(lower, w));
      const advisory = ADVISORY_WORDS.find((w) => containsWord(lower, w));
      if (!binding || !advisory) continue;

      out.push({
        ruleId: "clarity/binding-ambiguous",
        severity: "warning",
        message: `Mixed modal language ("${binding}" + "${advisory}") — pick binding or advisory, not both.`,
        range: rule.range,
        data: { binding, advisory },
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
