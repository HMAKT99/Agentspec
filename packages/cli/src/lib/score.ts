import type { MdpactConfig } from "@mdpact/config";
import type { LintReport, ParsedSpec } from "@mdpact/core";

export interface ScoreBreakdown {
  base: 100;
  errors: { count: number; delta: number };
  warnings: { count: number; delta: number };
  infos: { count: number; delta: number };
  tokenBudget: { exceeded: boolean; delta: number };
  frontmatter: { missing: boolean; delta: number };
  total: number;
}

export function computeScore(report: LintReport, config: MdpactConfig): ScoreBreakdown {
  const errors = report.errorCount;
  const warnings = report.warningCount;
  const infos = report.infoCount;

  const tokenExceeded = isTokenBudgetExceeded(report.specs, config);
  const missingFrontmatter = report.specs.some((s) => Object.keys(s.frontmatter).length === 0);

  const errorsDelta = -8 * errors;
  const warningsDelta = -3 * warnings;
  const infosDelta = -1 * infos;
  const tokenDelta = tokenExceeded ? -5 : 0;
  const frontmatterDelta = missingFrontmatter ? -2 : 0;

  const raw = 100 + errorsDelta + warningsDelta + infosDelta + tokenDelta + frontmatterDelta;
  const total = Math.max(0, Math.round(raw));

  return {
    base: 100,
    errors: { count: errors, delta: errorsDelta },
    warnings: { count: warnings, delta: warningsDelta },
    infos: { count: infos, delta: infosDelta },
    tokenBudget: { exceeded: tokenExceeded, delta: tokenDelta },
    frontmatter: { missing: missingFrontmatter, delta: frontmatterDelta },
    total,
  };
}

function isTokenBudgetExceeded(specs: ParsedSpec[], config: MdpactConfig): boolean {
  const budget = config.budgets.tokens;
  if (typeof budget !== "number") return false;
  return specs.some((s) => s.tokens > budget);
}
