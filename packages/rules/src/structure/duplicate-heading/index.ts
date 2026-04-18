import type { Rule, RuleResult, SourceRange } from "@agentspec/core";
import type { Heading } from "mdast";
import { toString as mdToString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";

export const duplicateHeading: Rule = {
  id: "structure/duplicate-heading",
  severity: "warning",
  description: "The same heading text appears more than once in a spec.",
  category: "structure",
  fixable: false,
  docsUrl: "https://agentspec.dev/rules/structure/duplicate-heading",

  run(ctx): RuleResult[] {
    const seen = new Map<string, SourceRange>();
    const results: RuleResult[] = [];

    visit(ctx.spec.tree, "heading", (node) => {
      const h = node as Heading;
      const pos = h.position;
      if (!pos) return;
      const text = mdToString(h).trim();
      if (!text) return;

      const key = text.toLowerCase();
      const range: SourceRange = {
        start: { file: ctx.spec.file, line: pos.start.line, column: pos.start.column },
        end: { file: ctx.spec.file, line: pos.end.line, column: pos.end.column },
      };

      const previous = seen.get(key);
      if (previous) {
        results.push({
          ruleId: "structure/duplicate-heading",
          severity: "warning",
          message: `Duplicate heading "${text}" — first seen at ${previous.start.line}:${previous.start.column}.`,
          range,
          data: { firstRange: previous },
        });
      } else {
        seen.set(key, range);
      }
    });

    return results;
  },
};
