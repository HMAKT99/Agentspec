import type { Rule, RuleResult } from "@agentspec/core";

export const noFrontmatter: Rule = {
  id: "structure/no-frontmatter",
  severity: "warning",
  description: "Specs should declare at least version and owner metadata in YAML frontmatter.",
  category: "structure",
  fixable: false,
  docsUrl: "https://agentspec.dev/rules/structure/no-frontmatter",

  run(ctx): RuleResult[] {
    if (Object.keys(ctx.spec.frontmatter).length > 0) return [];

    return [
      {
        ruleId: "structure/no-frontmatter",
        severity: "warning",
        message: "Spec has no frontmatter — declare at least `version` and `owner`.",
        range: {
          start: { file: ctx.spec.file, line: 1, column: 1 },
          end: { file: ctx.spec.file, line: 1, column: 1 },
        },
      },
    ];
  },
};
