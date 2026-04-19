import type { Rule, RuleResult } from "@mdpact/core";

export const emptySpec: Rule = {
  id: "structure/empty-spec",
  severity: "error",
  description:
    "A spec contains no binding, advisory, or exception directives — the file cannot govern agent behavior.",
  category: "structure",
  fixable: false,
  docsUrl: "https://mdpact.dev/rules/structure/empty-spec",

  run(ctx): RuleResult[] {
    const directiveCount = ctx.spec.extractedRules.filter((r) => r.kind !== "informational").length;

    if (directiveCount > 0) return [];

    return [
      {
        ruleId: "structure/empty-spec",
        severity: "error",
        message:
          "Spec contains no directives (no binding, advisory, or exception statements). Agents have nothing to follow — is this really an agent spec?",
        range: {
          start: { file: ctx.spec.file, line: 1, column: 1, offset: 0 },
          end: { file: ctx.spec.file, line: 1, column: 1, offset: 0 },
        },
      },
    ];
  },
};
