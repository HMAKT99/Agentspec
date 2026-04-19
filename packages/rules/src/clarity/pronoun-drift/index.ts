import type { Rule, RuleResult } from "@mdpact/core";

const PRONOUNS = ["it", "this", "that", "these", "those", "they", "them"];

export const pronounDrift: Rule = {
  id: "clarity/pronoun-drift",
  severity: "info",
  description: "A directive starts with a pronoun whose antecedent is outside the sentence.",
  category: "clarity",
  fixable: false,
  docsUrl: "https://mdpact.dev/rules/clarity/pronoun-drift",

  run(ctx): RuleResult[] {
    const out: RuleResult[] = [];
    for (const rule of ctx.spec.extractedRules) {
      if (rule.kind === "informational") continue;

      const firstWord = rule.text
        .trim()
        .split(/\s+/)[0]
        ?.toLowerCase()
        .replace(/[.,;:!?]/g, "");
      if (!firstWord) continue;
      if (!PRONOUNS.includes(firstWord)) continue;

      out.push({
        ruleId: "clarity/pronoun-drift",
        severity: "info",
        message: `Directive starts with "${firstWord}" — an agent reading the rule out of context cannot resolve the antecedent. Name the thing.`,
        range: rule.range,
        data: { pronoun: firstWord },
      });
    }
    return out;
  },
};
