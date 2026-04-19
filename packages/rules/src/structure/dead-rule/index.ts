import type { ExtractedRule, Rule, RuleResult } from "@mdpact/core";

/**
 * structure/dead-rule — a later rule is subsumed by an earlier rule of greater
 * strength over the same scope, so it can never actually take effect.
 *
 * The canonical dead case: an earlier binding directive and a later advisory
 * directive with the same verb, object, and polarity. The advisory can't weaken
 * the binding; it's dead weight.
 */
export const deadRule: Rule = {
  id: "structure/dead-rule",
  severity: "info",
  description: "A later advisory directive is subsumed by an earlier binding directive.",
  category: "structure",
  fixable: false,
  docsUrl: "https://mdpact.dev/rules/structure/dead-rule",

  run(ctx): RuleResult[] {
    const rules = ctx.spec.extractedRules;
    const out: RuleResult[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < rules.length; i++) {
      const earlier = rules[i];
      if (!earlier || earlier.kind !== "binding") continue;

      for (let j = i + 1; j < rules.length; j++) {
        const later = rules[j];
        if (!later || later.kind !== "advisory") continue;
        if (!subsumes(earlier, later)) continue;

        const key = `${earlier.id}__${later.id}`;
        if (seen.has(key)) continue;
        seen.add(key);

        out.push({
          ruleId: "structure/dead-rule",
          severity: "info",
          message: `Advisory rule "${truncate(later.text)}" is dead — an earlier binding rule "${truncate(earlier.text)}" already mandates it.`,
          range: later.range,
          data: { binding: earlier.text, dead: later.text },
        });
      }
    }

    return out;
  },
};

function subsumes(a: ExtractedRule, b: ExtractedRule): boolean {
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

function truncate(s: string, n = 60): string {
  return s.length <= n ? s : `${s.slice(0, n - 1)}…`;
}
