import type { AgentSpecConfig } from "@agentspec/config";
import type { LintConfig } from "@agentspec/core";

export function toLintConfig(config: AgentSpecConfig): LintConfig {
  const rules: LintConfig["rules"] = {};
  for (const [id, sev] of Object.entries(config.rules)) {
    rules[id] = sev;
  }
  return {
    rules,
    ruleOptions: config.ruleOptions,
  };
}
