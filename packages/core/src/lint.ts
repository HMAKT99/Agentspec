import type { LintConfig, LintReport, ParsedSpec, Rule, Severity } from "./types.js";

export interface LintInput {
  specs: ParsedSpec[];
  rules: Rule<any>[];
  config?: LintConfig;
}

export function lint({ specs, rules, config = {} }: LintInput): LintReport {
  const start = performance.now();
  const active = filterRules(rules, config);
  const results = [];

  for (const spec of specs) {
    for (const rule of active) {
      const severity = severityFor(rule, config);
      if (severity === "off") continue;

      const options = config.ruleOptions?.[rule.id] ?? {};
      const ruleResults = rule.run({ spec, allSpecs: specs, options });
      for (const r of ruleResults) {
        results.push({ ...r, severity });
      }
    }
  }

  const errorCount = results.filter((r) => r.severity === "error").length;
  const warningCount = results.filter((r) => r.severity === "warning").length;
  const infoCount = results.filter((r) => r.severity === "info").length;

  return {
    results,
    specs,
    errorCount,
    warningCount,
    infoCount,
    durationMs: performance.now() - start,
  };
}

function filterRules(rules: Rule<any>[], config: LintConfig): Rule<any>[] {
  return rules.filter((r) => severityFor(r, config) !== "off");
}

function severityFor(rule: Rule<any>, config: LintConfig): Severity | "off" {
  const overrides = config.rules ?? {};
  const exact = overrides[rule.id];
  if (exact !== undefined) return exact;

  for (const [pattern, sev] of Object.entries(overrides)) {
    if (pattern.endsWith("/*") && rule.id.startsWith(pattern.slice(0, -1))) {
      return sev;
    }
  }

  return rule.severity;
}
