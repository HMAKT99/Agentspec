import type { Rule, RuleContext, RuleResult } from "@mdpact/core";
import { z } from "zod";

const optionsSchema = z
  .object({
    minTokens: z.number().int().positive().default(50),
  })
  .strict();

type Options = z.infer<typeof optionsSchema>;

export const tooShort: Rule<Options> = {
  id: "structure/too-short",
  severity: "warning",
  description:
    "A spec is too short to meaningfully govern agent behavior — typical working specs are at least 50 tokens.",
  category: "structure",
  fixable: false,
  docsUrl: "https://mdpact.dev/rules/structure/too-short",
  schema: optionsSchema,

  run(ctx: RuleContext<Options>): RuleResult[] {
    const { minTokens } = optionsSchema.parse(ctx.options ?? {});
    if (ctx.spec.tokens >= minTokens) return [];

    return [
      {
        ruleId: "structure/too-short",
        severity: "warning",
        message: `Spec is only ${ctx.spec.tokens} token${
          ctx.spec.tokens === 1 ? "" : "s"
        } (minimum expected: ${minTokens}). Short files rarely have enough context to steer an agent reliably.`,
        range: {
          start: { file: ctx.spec.file, line: 1, column: 1, offset: 0 },
          end: { file: ctx.spec.file, line: 1, column: 1, offset: 0 },
        },
        data: { tokens: ctx.spec.tokens, minTokens },
      },
    ];
  },
};
