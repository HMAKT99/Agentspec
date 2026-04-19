import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { type LintConfig, lint, parseSpec } from "@mdpact/core";
import { describe, expect, it } from "vitest";

import { allRules } from "./index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const FIXTURE_RULES: string[] = [
  "conflict/binding",
  "conflict/binding-exception",
  "conflict/scope-overlap",
  "conflict/tool-policy",
  "clarity/binding-ambiguous",
  "clarity/pronoun-drift",
  "clarity/undefined-term",
  "clarity/vague-directive",
  "tools/destructive-no-confirm",
  "tools/missing-when",
  "tools/unknown-tool",
  "structure/dead-rule",
  "structure/duplicate-heading",
  "structure/empty-spec",
  "structure/no-frontmatter",
  "structure/no-sections",
  "structure/too-short",
  "tokens/budget",
  "tokens/buried-rule",
  "compliance/missing-human-gate",
  "compliance/pii-in-spec",
  "compliance/secret-in-spec",
];

function runFixture(ruleId: string, file: "good.md" | "bad.md") {
  const fixtureDir = join(__dirname, ruleId, "fixtures");
  const full = join(fixtureDir, file);
  const raw = readFileSync(full, "utf8");
  const spec = parseSpec(full, raw);

  // Per-file config wins over shared config.json.
  const specificConfigPath = join(fixtureDir, `${file.replace(/\.md$/, ".config.json")}`);
  const sharedConfigPath = join(fixtureDir, "config.json");
  const configPath = existsSync(specificConfigPath)
    ? specificConfigPath
    : existsSync(sharedConfigPath)
      ? sharedConfigPath
      : null;

  const config: LintConfig = configPath
    ? (JSON.parse(readFileSync(configPath, "utf8")) as LintConfig)
    : {};

  return lint({ specs: [spec], rules: allRules, config });
}

describe("rule catalog", () => {
  it("every rule has a unique id", () => {
    const ids = allRules.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every rule has a documented severity, category, and docsUrl", () => {
    for (const r of allRules) {
      expect(r.severity).toMatch(/error|warning|info/);
      expect(r.category.length).toBeGreaterThan(0);
      expect(r.docsUrl.startsWith("https://")).toBe(true);
    }
  });
});

describe("rule fixtures", () => {
  for (const ruleId of FIXTURE_RULES) {
    describe(ruleId, () => {
      it("good.md produces no diagnostics for this rule", () => {
        const report = runFixture(ruleId, "good.md");
        const own = report.results.filter((r) => r.ruleId === ruleId);
        expect(own, JSON.stringify(own, null, 2)).toEqual([]);
      });

      it("bad.md produces at least one diagnostic for this rule", () => {
        const report = runFixture(ruleId, "bad.md");
        const own = report.results.filter((r) => r.ruleId === ruleId);
        expect(own.length).toBeGreaterThan(0);
      });
    });
  }
});
