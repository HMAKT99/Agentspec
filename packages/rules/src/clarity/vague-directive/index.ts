import type { Rule, RuleResult } from "@mdpact/core";

const VAGUE_PHRASES = [
  "our standards",
  "best practices",
  "industry best practices",
  "our guidelines",
  "internal processes",
  "company conventions",
  "team conventions",
  "internal guidelines",
  "our approach",
  "as appropriate",
  "as needed",
  "the usual way",
];

const LINK_PATTERN = /\[[^\]]+\]\([^)]+\)|https?:\/\/\S+/;

export const vagueDirective: Rule = {
  id: "clarity/vague-directive",
  severity: "warning",
  description: "A rule references vague authority (standards, guidelines) without a link.",
  category: "clarity",
  fixable: false,
  docsUrl: "https://mdpact.dev/rules/clarity/vague-directive",

  run(ctx): RuleResult[] {
    const out: RuleResult[] = [];
    for (const rule of ctx.spec.extractedRules) {
      if (rule.kind === "informational") continue;

      const text = rule.text;
      const lower = text.toLowerCase();
      const match = VAGUE_PHRASES.find((p) => lower.includes(p));
      if (!match) continue;
      if (LINK_PATTERN.test(text)) continue;

      out.push({
        ruleId: "clarity/vague-directive",
        severity: "warning",
        message: `"${match}" points at authority the reader can't resolve — add a link or name the doc.`,
        range: rule.range,
        data: { phrase: match },
      });
    }
    return out;
  },
};
