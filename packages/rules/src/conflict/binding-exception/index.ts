import type { ExtractedRule, Rule, RuleResult } from "@agentspec/core";

const VAGUE_CONDITIONS = [
  "sometimes",
  "depending on",
  "as appropriate",
  "when you feel",
  "generally",
  "usually",
  "often",
  "in most cases",
  "if needed",
  "as needed",
  "unless otherwise",
];

export const bindingException: Rule = {
  id: "conflict/binding-exception",
  severity: "warning",
  description:
    "A binding rule is immediately followed by an exception whose trigger is vague, undermining the binding.",
  category: "conflict",
  fixable: false,
  docsUrl: "https://agentspec.dev/rules/conflict/binding-exception",

  run(ctx): RuleResult[] {
    const out: RuleResult[] = [];
    const rules = ctx.spec.extractedRules;

    for (let i = 0; i < rules.length; i++) {
      const a = rules[i];
      if (!a || a.kind !== "binding") continue;

      const b = rules[i + 1];
      if (!b || b.kind !== "exception") continue;
      if (!sameScope(a, b)) continue;

      const lower = b.text.toLowerCase();
      const vague = VAGUE_CONDITIONS.find((c) => lower.includes(c));
      if (!vague) continue;

      out.push({
        ruleId: "conflict/binding-exception",
        severity: "warning",
        message: `Binding rule is undermined by exception with vague trigger "${vague}". Name the exact condition that suspends the rule.`,
        range: b.range,
        data: { binding: a.text, exception: b.text, vagueCue: vague },
      });
    }

    return out;
  },
};

function sameScope(a: ExtractedRule, b: ExtractedRule): boolean {
  if (a.headingPath.length === 0 && b.headingPath.length === 0) return true;
  return a.headingPath.join(" > ") === b.headingPath.join(" > ");
}
