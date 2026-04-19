import type { ExtractedRule, Rule, RuleResult } from "@agentspec/core";

/**
 * conflict/cross-binding — two binding directives in *different* spec files
 * contradict each other. Same verb + object, opposite polarity.
 *
 * Fires once per (spec, conflicting-rule) pair on each side. Emits on every
 * involved spec so the reviewer sees the finding whichever file they're
 * looking at first.
 */
export const crossBinding: Rule = {
  id: "conflict/cross-binding",
  severity: "error",
  description: "Binding directives in different spec files contradict each other.",
  category: "conflict",
  fixable: false,
  docsUrl: "https://agentspec.dev/rules/conflict/cross-binding",

  run(ctx): RuleResult[] {
    if (ctx.allSpecs.length < 2) return [];
    const myBindings = ctx.spec.extractedRules.filter((r) => r.kind === "binding");
    const otherBindings: { spec: string; rule: ExtractedRule }[] = [];
    for (const other of ctx.allSpecs) {
      if (other.file === ctx.spec.file) continue;
      for (const r of other.extractedRules) {
        if (r.kind === "binding") otherBindings.push({ spec: other.file, rule: r });
      }
    }

    const out: RuleResult[] = [];
    const seen = new Set<string>();

    for (const mine of myBindings) {
      for (const { spec, rule: theirs } of otherBindings) {
        if (!contradicts(mine, theirs)) continue;
        // De-dupe the symmetric pair: sort the two file+id pairs so either
        // ordering yields the same key.
        const a = `${ctx.spec.file}|${mine.id}`;
        const b = `${spec}|${theirs.id}`;
        const key = a < b ? `${a}::${b}` : `${b}::${a}`;
        if (seen.has(key)) continue;
        seen.add(key);

        out.push({
          ruleId: "conflict/cross-binding",
          severity: "error",
          message: `Binding rule conflicts with ${relativeFileName(spec)}: "${truncate(mine.text)}" vs "${truncate(theirs.text)}"`,
          range: mine.range,
          data: {
            thisSpec: ctx.spec.file,
            thisRule: { text: mine.text, range: mine.range },
            otherSpec: spec,
            otherRule: { text: theirs.text, range: theirs.range },
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

function relativeFileName(path: string): string {
  const parts = path.split("/");
  return parts.slice(-2).join("/");
}
