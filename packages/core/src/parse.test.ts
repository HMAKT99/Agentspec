import { describe, expect, it } from "vitest";
import { parseSpec } from "./parse.js";

describe("parseSpec", () => {
  it("parses markdown without frontmatter", () => {
    const spec = parseSpec("test.md", "# Title\n\nYou must always use tabs.");
    expect(spec.frontmatter).toEqual({});
    expect(spec.extractedRules.length).toBeGreaterThan(0);
    expect(spec.tree.type).toBe("root");
  });

  it("parses YAML frontmatter", () => {
    const md = "---\nversion: 1\nowner: core-team\n---\n\n# Title\n\nMust use TypeScript.";
    const spec = parseSpec("test.md", md);
    expect(spec.frontmatter.version).toBe(1);
    expect(spec.frontmatter.owner).toBe("core-team");
  });

  it("classifies binding directives", () => {
    const spec = parseSpec("t.md", "- Always use tabs.\n- You must commit before pushing.");
    const binding = spec.extractedRules.filter((r) => r.kind === "binding");
    expect(binding.length).toBe(2);
  });

  it("classifies advisory directives separately from binding", () => {
    const spec = parseSpec("t.md", "- You should prefer const.\n- Always use tabs.");
    const kinds = spec.extractedRules.map((r) => r.kind).sort();
    expect(kinds).toContain("binding");
    expect(kinds).toContain("advisory");
  });

  it("detects polarity from negation words", () => {
    const spec = parseSpec("t.md", "- Never use tabs.\n- Always use tabs.");
    const polarities = spec.extractedRules.map((r) => r.polarity).sort();
    expect(polarities).toEqual(["affirm", "negate"]);
  });
});
