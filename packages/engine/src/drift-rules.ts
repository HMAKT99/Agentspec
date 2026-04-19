import type { Rule, RuleResult, SourceRange } from "@mdpact/core";
import type { BehaviorReport, Outcome, RunRecord } from "./types.js";

export interface DriftRuleOptions {
  /** Adherence rate below which a drift diagnostic fires. Default 0.7 (70%). */
  adherenceThreshold?: number;
  /** Minimum runs required on a tag before we bother computing drift. Default 3. */
  minRunsPerTag?: number;
}

interface TagAdherence {
  tag: string;
  total: number;
  acted: number;
  deviated: number;
  refused: number;
  clarified: number;
  adherence: number; // acted / total
}

/**
 * createDriftRules — produces a `behavior/drift` rule closed over a
 * `BehaviorReport`. The rule compares *declared* spec behavior against
 * *observed* model behavior and fires when the observed adherence on
 * tasks tagged for a given topic is below the configured threshold.
 *
 * Contract: a task's `tags` describe the topic(s) it exercises (e.g.
 * `["commit-before-push"]` or `["conflict/binding"]`). Per tag, adherence
 * = count(acted) / count(total). If adherence < threshold the rule emits a
 * `behavior/drift` diagnostic anchored to the first binding rule in the
 * spec whose text mentions any token from the tag — or, failing that,
 * at line 1 of the spec.
 *
 * The drift diagnostic is the moment where the lint layer starts calling
 * the *spec* a liar about what the agent does, not just flagging static
 * inconsistencies.
 */
export function createDriftRules(report: BehaviorReport, opts: DriftRuleOptions = {}): Rule[] {
  const adherenceThreshold = opts.adherenceThreshold ?? 0.7;
  const minRunsPerTag = opts.minRunsPerTag ?? 3;

  const adherenceByTag = computeAdherenceByTag(report.runs);

  const drift: Rule = {
    id: "behavior/drift",
    severity: "error",
    description:
      "Spec claims a behavior the agent does not reliably follow in practice (observed adherence below threshold).",
    category: "behavior",
    fixable: false,
    docsUrl: "https://mdpact.dev/rules/behavior/drift",

    run(ctx): RuleResult[] {
      const out: RuleResult[] = [];
      for (const row of adherenceByTag) {
        if (row.total < minRunsPerTag) continue;
        if (row.adherence >= adherenceThreshold) continue;

        const anchor = findAnchor(ctx.spec, row.tag);
        out.push({
          ruleId: "behavior/drift",
          severity: "error",
          message: `Spec drift: tasks tagged "${row.tag}" show adherence ${(row.adherence * 100).toFixed(0)}% (threshold ${(adherenceThreshold * 100).toFixed(0)}%, ${row.acted}/${row.total} runs acted, ${row.deviated} deviated, ${row.refused} refused, ${row.clarified} clarified). The spec's claim does not match observed behavior.`,
          range: anchor,
          data: { ...row },
        });
      }
      return out;
    },
  };

  return [drift];
}

function computeAdherenceByTag(runs: RunRecord[]): TagAdherence[] {
  const byTag = new Map<string, { outcomes: Record<Outcome, number>; total: number }>();
  for (const run of runs) {
    const tags = run.task.tags ?? [];
    for (const tag of tags) {
      const bag = byTag.get(tag) ?? {
        outcomes: { refused: 0, clarified: 0, acted: 0, deviated: 0 },
        total: 0,
      };
      bag.outcomes[run.outcome] += 1;
      bag.total += 1;
      byTag.set(tag, bag);
    }
  }

  const rows: TagAdherence[] = [];
  for (const [tag, { outcomes, total }] of byTag) {
    rows.push({
      tag,
      total,
      acted: outcomes.acted,
      deviated: outcomes.deviated,
      refused: outcomes.refused,
      clarified: outcomes.clarified,
      adherence: total === 0 ? 1 : outcomes.acted / total,
    });
  }
  return rows;
}

function findAnchor(
  spec: { file: string; extractedRules: { text: string; range: SourceRange; kind: string }[] },
  tag: string,
): SourceRange {
  const tokens = tag
    .toLowerCase()
    .split(/[\s\-_/]+/)
    .filter((t) => t.length >= 3);
  if (tokens.length === 0) return defaultRange(spec.file);

  for (const rule of spec.extractedRules) {
    if (rule.kind !== "binding" && rule.kind !== "advisory") continue;
    const lower = rule.text.toLowerCase();
    if (tokens.some((t) => lower.includes(t))) return rule.range;
  }
  return defaultRange(spec.file);
}

function defaultRange(file: string): SourceRange {
  return {
    start: { file, line: 1, column: 1 },
    end: { file, line: 1, column: 1 },
  };
}
