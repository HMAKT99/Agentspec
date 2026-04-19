import type { ExtractedRule, Rule, RuleResult } from "@mdpact/core";

export const scopeOverlap: Rule = {
  id: "conflict/scope-overlap",
  severity: "warning",
  description:
    "Two rules cover the same verb+object but disagree on strength (binding vs advisory).",
  category: "conflict",
  fixable: false,
  docsUrl: "https://mdpact.dev/rules/conflict/scope-overlap",

  run(ctx): RuleResult[] {
    const out: RuleResult[] = [];
    const seen = new Set<string>();
    const rules = ctx.spec.extractedRules.filter(
      (r) => r.kind === "binding" || r.kind === "advisory",
    );

    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        const a = rules[i]!;
        const b = rules[j]!;
        if (!overlaps(a, b)) continue;

        const key = `${a.id}__${b.id}`;
        if (seen.has(key)) continue;
        seen.add(key);

        out.push({
          ruleId: "conflict/scope-overlap",
          severity: "warning",
          message: `Same topic ("${a.verb} ${a.object}") appears as both ${a.kind} and ${b.kind}. Pick one strength.`,
          range: a.range,
          data: {
            ruleA: { text: a.text, kind: a.kind, range: a.range },
            ruleB: { text: b.text, kind: b.kind, range: b.range },
          },
        });
      }
    }
    return out;
  },
};

function overlaps(a: ExtractedRule, b: ExtractedRule): boolean {
  if (a.kind === b.kind) return false;
  if (!a.verb || !b.verb) return false;
  if (a.verb !== b.verb) return false;
  if (a.polarity !== b.polarity) return false;
  return sameObject(a.object, b.object);
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
