import type { Rule, RuleResult } from "@mdpact/core";
import type { BehaviorReport } from "./types.js";

export interface BehaviorRuleOptions {
  /** Per-task divergence ratio above which `behavior/divergence` fires. Default 0.3. */
  divergenceThreshold?: number;
  /** Per-task adherence ratio below which `behavior/unfollowed` fires. Default 0.8. */
  adherenceThreshold?: number;
}

export function createBehaviorRules(
  report: BehaviorReport,
  opts: BehaviorRuleOptions = {},
): Rule[] {
  const divergenceThreshold = opts.divergenceThreshold ?? 0.3;
  const adherenceThreshold = opts.adherenceThreshold ?? 0.8;

  const divergence: Rule = {
    id: "behavior/divergence",
    severity: "error",
    description:
      "Declared models diverge on how to interpret this spec at a task-level rate above the configured threshold.",
    category: "behavior",
    fixable: false,
    docsUrl: "https://mdpact.dev/rules/behavior/divergence",

    run(ctx): RuleResult[] {
      const out: RuleResult[] = [];
      for (const task of report.perTask) {
        if (task.divergenceAcrossModels <= divergenceThreshold) continue;
        out.push({
          ruleId: "behavior/divergence",
          severity: "error",
          message: `Task "${task.task}" diverges across models at ${Math.round(
            task.divergenceAcrossModels * 100,
          )}% (threshold ${Math.round(divergenceThreshold * 100)}%).`,
          range: {
            start: { file: ctx.spec.file, line: 1, column: 1 },
            end: { file: ctx.spec.file, line: 1, column: 1 },
          },
          data: { task: task.task, divergence: task.divergenceAcrossModels },
        });
      }
      return out;
    },
  };

  const unfollowed: Rule = {
    id: "behavior/unfollowed",
    severity: "warning",
    description:
      "Models do not follow the spec often enough on this task — adherence below the configured threshold.",
    category: "behavior",
    fixable: false,
    docsUrl: "https://mdpact.dev/rules/behavior/unfollowed",

    run(ctx): RuleResult[] {
      const out: RuleResult[] = [];
      for (const task of report.perTask) {
        if (task.total === 0) continue;
        if (task.adherence >= adherenceThreshold) continue;
        out.push({
          ruleId: "behavior/unfollowed",
          severity: "warning",
          message: `Task "${task.task}" adherence ${Math.round(
            task.adherence * 100,
          )}% is below the configured threshold ${Math.round(adherenceThreshold * 100)}%.`,
          range: {
            start: { file: ctx.spec.file, line: 1, column: 1 },
            end: { file: ctx.spec.file, line: 1, column: 1 },
          },
          data: { task: task.task, adherence: task.adherence, outcomes: task.outcomes },
        });
      }
      return out;
    },
  };

  return [divergence, unfollowed];
}
