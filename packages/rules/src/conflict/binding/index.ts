import type { ExtractedRule, Rule, RuleResult } from "@mdpact/core";

export const bindingConflict: Rule = {
  id: "conflict/binding",
  severity: "error",
  description: "Two binding directives directly contradict each other.",
  category: "conflict",
  fixable: false,
  docsUrl: "https://mdpact.dev/rules/conflict/binding",

  run(ctx): RuleResult[] {
    const bindings = ctx.spec.extractedRules.filter((r) => r.kind === "binding");
    const out: RuleResult[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < bindings.length; i++) {
      for (let j = i + 1; j < bindings.length; j++) {
        const a = bindings[i]!;
        const b = bindings[j]!;
        if (!contradicts(a, b)) continue;

        const key = `${a.id}__${b.id}`;
        if (seen.has(key)) continue;
        seen.add(key);

        out.push({
          ruleId: "conflict/binding",
          severity: "error",
          message: `Binding rules contradict: "${truncate(a.text)}" vs "${truncate(b.text)}"`,
          range: a.range,
          data: {
            ruleA: { text: a.text, range: a.range },
            ruleB: { text: b.text, range: b.range },
          },
        });
      }
    }

    return out;
  },
};

function contradicts(a: ExtractedRule, b: ExtractedRule): boolean {
  if (!a.verb || !b.verb) return false;
  if (a.verb !== b.verb) return false;
  if (!sameObject(a.object, b.object)) return false;
  return a.polarity !== b.polarity;
}

function sameObject(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return true;
  const aTokens = new Set(na.split(/\s+/).filter(Boolean));
  const bTokens = new Set(nb.split(/\s+/).filter(Boolean));
  if (aTokens.size === 0 || bTokens.size === 0) return false;
  const overlap = [...aTokens].filter((t) => bTokens.has(t)).length;
  return overlap / Math.min(aTokens.size, bTokens.size) >= 0.6;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(s: string, n = 60): string {
  return s.length <= n ? s : `${s.slice(0, n - 1)}…`;
}
