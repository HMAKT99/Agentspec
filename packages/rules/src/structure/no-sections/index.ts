import type { Rule, RuleContext, RuleResult } from "@mdpact/core";
import type { Heading } from "mdast";
import { visit } from "unist-util-visit";
import { z } from "zod";

const optionsSchema = z
  .object({
    minLines: z.number().int().positive().default(200),
    minHeadings: z.number().int().positive().default(2),
  })
  .strict();

type Options = z.infer<typeof optionsSchema>;

export const noSections: Rule<Options> = {
  id: "structure/no-sections",
  severity: "warning",
  description: "Long specs should be broken into sections with H2+ headings.",
  category: "structure",
  fixable: false,
  docsUrl: "https://mdpact.dev/rules/structure/no-sections",
  schema: optionsSchema,

  run(ctx: RuleContext<Options>): RuleResult[] {
    const { minLines, minHeadings } = optionsSchema.parse(ctx.options ?? {});
    const lineCount = ctx.spec.raw.split(/\r?\n/).length;
    if (lineCount < minLines) return [];

    let subHeadingCount = 0;
    visit(ctx.spec.tree, "heading", (node) => {
      const h = node as Heading;
      if (h.depth >= 2) subHeadingCount += 1;
    });

    if (subHeadingCount >= minHeadings) return [];

    return [
      {
        ruleId: "structure/no-sections",
        severity: "warning",
        message: `Spec is ${lineCount} lines but has only ${subHeadingCount} H2+ heading${
          subHeadingCount === 1 ? "" : "s"
        }. Break it into sections.`,
        range: {
          start: { file: ctx.spec.file, line: 1, column: 1 },
          end: { file: ctx.spec.file, line: 1, column: 1 },
        },
      },
    ];
  },
};
