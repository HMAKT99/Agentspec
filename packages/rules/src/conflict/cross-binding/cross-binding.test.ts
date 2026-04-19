import { lint, parseSpec } from "@agentspec/core";
import { describe, expect, it } from "vitest";
import { crossBinding } from "./index.js";

function parse(file: string, raw: string) {
  return parseSpec(file, raw);
}

describe("conflict/cross-binding", () => {
  it("does nothing with a single spec", () => {
    const specs = [parse("CLAUDE.md", "- You must always commit before pushing.")];
    const report = lint({ specs, rules: [crossBinding] });
    expect(report.results).toEqual([]);
  });

  it("fires when two files disagree", () => {
    const specs = [
      parse("CLAUDE.md", "- You must always commit before pushing."),
      parse("AGENTS.md", "- Never commit before pushing."),
    ];
    const report = lint({ specs, rules: [crossBinding] });
    const ids = report.results.map((r) => r.ruleId);
    expect(ids).toContain("conflict/cross-binding");
    // Both specs should surface the finding so reviewers see it in either file.
    const files = new Set(report.results.map((r) => r.range.start.file));
    expect(files.has("CLAUDE.md")).toBe(true);
    expect(files.has("AGENTS.md")).toBe(true);
  });

  it("is silent when both files agree", () => {
    const specs = [
      parse("CLAUDE.md", "- You must always commit before pushing."),
      parse("AGENTS.md", "- You must always commit before pushing."),
    ];
    const report = lint({ specs, rules: [crossBinding] });
    expect(report.results).toEqual([]);
  });

  it("does not fire on same-file contradictions (that's conflict/binding)", () => {
    const specs = [
      parse(
        "CLAUDE.md",
        "- You must always commit before pushing.\n- Never commit before pushing.",
      ),
    ];
    const report = lint({ specs, rules: [crossBinding] });
    expect(report.results).toEqual([]);
  });

  it("de-dupes symmetric matches so each cross-file pair is reported once per side", () => {
    const specs = [
      parse("CLAUDE.md", "- You must always commit before pushing."),
      parse("AGENTS.md", "- Never commit before pushing."),
    ];
    const report = lint({ specs, rules: [crossBinding] });
    // One finding per side = 2 total for a single conflicting pair.
    expect(report.results.length).toBe(2);
  });
});
