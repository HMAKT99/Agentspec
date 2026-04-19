import type { Rule, RuleContext, RuleResult } from "@mdpact/core";
import { z } from "zod";

const optionsSchema = z
  .object({
    max: z.number().int().positive().default(10_000),
  })
  .strict();

type Options = z.infer<typeof optionsSchema>;

export const tokensBudget: Rule<Options> = {
  id: "tokens/budget",
  severity: "warning",
  description: "Spec exceeds the configured token budget.",
  category: "tokens",
  fixable: false,
  docsUrl: "https://mdpact.dev/rules/tokens/budget",
  schema: optionsSchema,

  run(ctx: RuleContext<Options>): RuleResult[] {
    const { max } = optionsSchema.parse(ctx.options ?? {});
    if (ctx.spec.tokens <= max) return [];

    return [
      {
        ruleId: "tokens/budget",
        severity: "warning",
        message: `Spec is ~${ctx.spec.tokens} tokens, above the configured budget of ${max}.`,
        range: {
          start: { file: ctx.spec.file, line: 1, column: 1 },
          end: { file: ctx.spec.file, line: 1, column: 1 },
        },
        data: { tokens: ctx.spec.tokens, budget: max },
      },
    ];
  },
};
