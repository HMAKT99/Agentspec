import { lint, parseSpec } from "@agentspec/core";
import { describe, expect, it } from "vitest";
import { crossToolPolicy } from "./index.js";

function parse(file: string, raw: string) {
  return parseSpec(file, raw);
}

describe("conflict/cross-tool-policy", () => {
  it("does nothing with a single spec", () => {
    const specs = [
      parse(
        "CLAUDE.md",
        "## Local dev\n\n- Use `docker push` when testing locally.\n\n## Production\n\n- Never run `docker` in production.\n",
      ),
    ];
    const report = lint({ specs, rules: [crossToolPolicy] });
    // Same-file conflict is handled by conflict/tool-policy, not this rule.
    expect(report.results).toEqual([]);
  });

  it("fires when allow and restrict live in different spec files", () => {
    const specs = [
      parse("CLAUDE.md", "## Local dev\n\n- Use `docker push` when testing locally.\n"),
      parse("AGENTS.md", "## Production\n\n- Never run `docker` in production.\n"),
    ];
    const report = lint({ specs, rules: [crossToolPolicy] });
    const byFile = new Set(report.results.map((r) => r.range.start.file));
    expect(byFile.has("CLAUDE.md")).toBe(true);
    expect(byFile.has("AGENTS.md")).toBe(true);
    for (const r of report.results) {
      expect(r.ruleId).toBe("conflict/cross-tool-policy");
      expect(r.message).toContain("docker");
    }
  });

  it("stays silent when the tool has a consistent policy across files", () => {
    const specs = [
      parse("CLAUDE.md", "- Use `gh pr create` to open pull requests.\n"),
      parse("AGENTS.md", "- When shipping a release, prefer `gh release`.\n"),
    ];
    const report = lint({ specs, rules: [crossToolPolicy] });
    expect(report.results).toEqual([]);
  });
});
