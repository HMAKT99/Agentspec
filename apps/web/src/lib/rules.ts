import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Rule } from "@agentspec/core";
import { allRules } from "@agentspec/rules";

const __dirname = dirname(fileURLToPath(import.meta.url));

// apps/web/src/lib/rules.ts → packages/rules/src/…
const RULES_SRC = join(__dirname, "../../../../packages/rules/src");

export interface RuleSummary {
  id: string;
  category: string;
  severity: "error" | "warning" | "info";
  description: string;
  fixable: "safe" | "unsafe" | false;
  docsUrl: string;
}

export interface RuleDetail extends RuleSummary {
  docsMarkdown: string | null;
  goodMarkdown: string | null;
  badMarkdown: string | null;
}

export function listRules(): RuleSummary[] {
  return (allRules as Rule[])
    .map((r) => ({
      id: r.id,
      category: r.category,
      severity: r.severity,
      description: r.description,
      fixable: r.fixable,
      docsUrl: r.docsUrl,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function getRule(id: string): RuleDetail | null {
  const rule = (allRules as Rule[]).find((r) => r.id === id);
  if (!rule) return null;

  const ruleDir = join(RULES_SRC, rule.id);
  return {
    id: rule.id,
    category: rule.category,
    severity: rule.severity,
    description: rule.description,
    fixable: rule.fixable,
    docsUrl: rule.docsUrl,
    docsMarkdown: readIfExists(join(ruleDir, "docs.md")),
    goodMarkdown: readIfExists(join(ruleDir, "fixtures/good.md")),
    badMarkdown: readIfExists(join(ruleDir, "fixtures/bad.md")),
  };
}

function readIfExists(p: string): string | null {
  return existsSync(p) ? readFileSync(p, "utf8") : null;
}

export function groupByCategory(rules: RuleSummary[]): Record<string, RuleSummary[]> {
  const out: Record<string, RuleSummary[]> = {};
  for (const r of rules) {
    if (!out[r.category]) out[r.category] = [];
    out[r.category]!.push(r);
  }
  return out;
}
