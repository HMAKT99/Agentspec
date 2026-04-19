import type { MdpactConfig } from "@mdpact/config";
import type { LintReport, ParsedSpec } from "@mdpact/core";

export interface ScoreBreakdown {
  total: number;
  errors: number;
  warnings: number;
  infos: number;
  tokenBudgetExceeded: boolean;
  missingFrontmatter: boolean;
}

export function computeScore(report: LintReport, config: MdpactConfig): ScoreBreakdown {
  const errors = report.errorCount;
  const warnings = report.warningCount;
  const infos = report.infoCount;

  const tokenBudgetExceeded = isTokenBudgetExceeded(report.specs, config);
  const missingFrontmatter = report.specs.some((s) => Object.keys(s.frontmatter).length === 0);

  const raw =
    100 -
    8 * errors -
    3 * warnings -
    1 * infos -
    (tokenBudgetExceeded ? 5 : 0) -
    (missingFrontmatter ? 2 : 0);

  return {
    total: Math.max(0, Math.round(raw)),
    errors,
    warnings,
    infos,
    tokenBudgetExceeded,
    missingFrontmatter,
  };
}

function isTokenBudgetExceeded(specs: ParsedSpec[], config: MdpactConfig): boolean {
  const budget = config.budgets?.tokens;
  if (typeof budget !== "number") return false;
  return specs.some((s) => s.tokens > budget);
}
