import { describe, expect, it } from "vitest";
import { applyFixes } from "./apply-fixes.js";
import type { Fix } from "./types.js";

function fix(startOffset: number, endOffset: number, replacement: string): Fix {
  return {
    range: {
      start: { file: "t.md", line: 1, column: 1, offset: startOffset },
      end: { file: "t.md", line: 1, column: 1, offset: endOffset },
    },
    replacement,
    description: "test",
  };
}

describe("applyFixes", () => {
  it("applies a single edit", () => {
    const raw = "hello world";
    const result = applyFixes(raw, [fix(6, 11, "there")]);
    expect(result.text).toBe("hello there");
    expect(result.applied.length).toBe(1);
    expect(result.skipped).toEqual([]);
  });

  it("applies non-overlapping edits in order", () => {
    const raw = "abc def ghi";
    const result = applyFixes(raw, [fix(0, 3, "AAA"), fix(8, 11, "GGG")]);
    expect(result.text).toBe("AAA def GGG");
    expect(result.applied.length).toBe(2);
  });

  it("skips overlapping edits", () => {
    const raw = "abcdef";
    const a = fix(0, 4, "X");
    const b = fix(2, 6, "Y");
    const result = applyFixes(raw, [a, b]);
    expect(result.applied).toEqual([a]);
    expect(result.skipped.length).toBe(1);
    expect(result.skipped[0]!.reason).toContain("overlaps");
  });

  it("skips fixes without byte offsets", () => {
    const noOffset: Fix = {
      range: {
        start: { file: "t.md", line: 1, column: 1 },
        end: { file: "t.md", line: 1, column: 1 },
      },
      replacement: "X",
      description: "no offset",
    };
    const result = applyFixes("abc", [noOffset]);
    expect(result.text).toBe("abc");
    expect(result.skipped.length).toBe(1);
  });

  it("handles insertion (zero-length range)", () => {
    const raw = "hello";
    const result = applyFixes(raw, [fix(0, 0, "HI ")]);
    expect(result.text).toBe("HI hello");
  });
});
