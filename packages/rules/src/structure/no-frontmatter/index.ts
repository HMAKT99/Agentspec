import type { Fix, Rule, RuleResult } from "@agentspec/core";

const DEFAULT_FRONTMATTER = `---
version: 1
owner: TODO
---

`;

export const noFrontmatter: Rule = {
  id: "structure/no-frontmatter",
  severity: "warning",
  description: "Specs should declare at least version and owner metadata in YAML frontmatter.",
  category: "structure",
  fixable: "unsafe",
  docsUrl: "https://agentspec.dev/rules/structure/no-frontmatter",

  run(ctx): RuleResult[] {
    if (Object.keys(ctx.spec.frontmatter).length > 0) return [];

    return [
      {
        ruleId: "structure/no-frontmatter",
        severity: "warning",
        message: "Spec has no frontmatter — declare at least `version` and `owner`.",
        range: {
          start: { file: ctx.spec.file, line: 1, column: 1, offset: 0 },
          end: { file: ctx.spec.file, line: 1, column: 1, offset: 0 },
        },
        fixable: true,
      },
    ];
  },

  fix(ctx): Fix | null {
    if (Object.keys(ctx.spec.frontmatter).length > 0) return null;
    return {
      range: {
        start: { file: ctx.spec.file, line: 1, column: 1, offset: 0 },
        end: { file: ctx.spec.file, line: 1, column: 1, offset: 0 },
      },
      replacement: DEFAULT_FRONTMATTER,
      description:
        "Insert a placeholder `version`/`owner` frontmatter block at the top of the file.",
    };
  },
};
