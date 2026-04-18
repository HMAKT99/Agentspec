import type { LintReport } from "@agentspec/core";
import { describe, expect, it } from "vitest";
import { renderJson, renderPretty } from "./index.js";

const emptyReport: LintReport = {
  results: [],
  specs: [
    {
      file: "/tmp/CLAUDE.md",
      raw: "",
      tree: { type: "root", children: [] } as any,
      frontmatter: {},
      extractedRules: [],
      tokens: 0,
    },
  ],
  errorCount: 0,
  warningCount: 0,
  infoCount: 0,
  durationMs: 1,
};

const withError: LintReport = {
  ...emptyReport,
  results: [
    {
      ruleId: "conflict/binding",
      severity: "error",
      message: "contradicts",
      range: {
        start: { file: "/tmp/CLAUDE.md", line: 3, column: 1 },
        end: { file: "/tmp/CLAUDE.md", line: 3, column: 40 },
      },
    },
  ],
  errorCount: 1,
};

describe("renderJson", () => {
  it("emits valid JSON with expected shape", () => {
    const json = renderJson(withError);
    const parsed = JSON.parse(json);
    expect(parsed.errorCount).toBe(1);
    expect(parsed.results[0].ruleId).toBe("conflict/binding");
    expect(parsed.results[0].line).toBe(3);
  });
});

describe("renderPretty", () => {
  it("shows success state when clean", () => {
    const out = renderPretty(emptyReport);
    expect(out).toContain("No issues found");
  });

  it("shows errors when present", () => {
    const out = renderPretty(withError);
    expect(out).toContain("conflict/binding");
    expect(out).toContain("contradicts");
  });
});
