import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { lint, parseSpec } from "@agentspec/core";
import { describe, expect, it } from "vitest";

import { allRules } from "./index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function runFixture(rulePath: string, file: "good.md" | "bad.md") {
  const full = join(__dirname, rulePath, "fixtures", file);
  const raw = readFileSync(full, "utf8");
  const spec = parseSpec(full, raw);
  return lint({ specs: [spec], rules: allRules });
}

describe("rule fixtures", () => {
  const rulePaths = [["conflict/binding", "conflict/binding"]] as const;

  for (const [ruleId, path] of rulePaths) {
    describe(ruleId, () => {
      it("good.md produces no diagnostics for this rule", () => {
        const report = runFixture(path, "good.md");
        const own = report.results.filter((r) => r.ruleId === ruleId);
        expect(own).toEqual([]);
      });

      it("bad.md produces at least one diagnostic for this rule", () => {
        const report = runFixture(path, "bad.md");
        const own = report.results.filter((r) => r.ruleId === ruleId);
        expect(own.length).toBeGreaterThan(0);
      });
    });
  }
});
