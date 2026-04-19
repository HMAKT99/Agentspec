import type { MdpactConfig } from "@mdpact/config";
import type { LintReport, ParsedSpec } from "@mdpact/core";
import { describe, expect, it } from "vitest";
import { computeScore } from "./score.js";

const baseConfig: MdpactConfig = {
  specs: [],
  rules: {},
  ruleOptions: {},
  budgets: {},
  models: [],
  behaviorTests: {},
  score: {},
};

function makeSpec(partial: Partial<ParsedSpec> = {}): ParsedSpec {
  return {
    file: "/tmp/CLAUDE.md",
    raw: "",
    tree: { type: "root", children: [] } as any,
    frontmatter: {},
    extractedRules: [],
    inlineCode: [],
    tokens: 100,
    ...partial,
  };
}

function makeReport(
  partial: Partial<LintReport> = {},
  specs: ParsedSpec[] = [makeSpec()],
): LintReport {
  return {
    results: [],
    specs,
    errorCount: 0,
    warningCount: 0,
    infoCount: 0,
    durationMs: 1,
    ...partial,
  };
}

describe("computeScore", () => {
  it("starts at 100 for a clean spec with frontmatter", () => {
    const spec = makeSpec({ frontmatter: { version: 1 } });
    const score = computeScore(makeReport({}, [spec]), baseConfig);
    expect(score.total).toBe(100);
  });

  it("deducts 2 for missing frontmatter", () => {
    const score = computeScore(makeReport(), baseConfig);
    expect(score.total).toBe(98);
    expect(score.frontmatter.missing).toBe(true);
  });

  it("applies -8/-3/-1 per diagnostic severity", () => {
    const spec = makeSpec({ frontmatter: { a: 1 } });
    const score = computeScore(
      makeReport({ errorCount: 2, warningCount: 3, infoCount: 1 }, [spec]),
      baseConfig,
    );
    // 100 - 16 - 9 - 1 = 74
    expect(score.total).toBe(74);
  });

  it("deducts 5 when a spec exceeds token budget", () => {
    const spec = makeSpec({ frontmatter: { a: 1 }, tokens: 20_000 });
    const score = computeScore(makeReport({}, [spec]), {
      ...baseConfig,
      budgets: { tokens: 10_000 },
    });
    expect(score.total).toBe(95);
    expect(score.tokenBudget.exceeded).toBe(true);
  });

  it("floors at 0", () => {
    const spec = makeSpec({ frontmatter: { a: 1 } });
    const score = computeScore(makeReport({ errorCount: 50 }, [spec]), baseConfig);
    expect(score.total).toBe(0);
  });
});
