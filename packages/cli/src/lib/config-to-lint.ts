import type { MdpactConfig } from "@mdpact/config";
import type { LintConfig } from "@mdpact/core";

export function toLintConfig(config: MdpactConfig): LintConfig {
  const rules: LintConfig["rules"] = {};
  for (const [id, sev] of Object.entries(config.rules)) {
    rules[id] = sev;
  }
  return {
    rules,
    ruleOptions: config.ruleOptions,
  };
}
