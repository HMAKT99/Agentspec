import type { Rule, RuleContext, RuleResult } from "@agentspec/core";
import { z } from "zod";

const optionsSchema = z
  .object({
    attentionTokens: z.number().int().positive().default(4_000),
  })
  .strict();

type Options = z.infer<typeof optionsSchema>;

const CHARS_PER_TOKEN = 4;

export const buriedRule: Rule<Options> = {
  id: "tokens/buried-rule",
  severity: "warning",
  description: "A binding rule sits below the attention threshold — models may skip it.",
  category: "tokens",
  fixable: false,
  docsUrl: "https://agentspec.dev/rules/tokens/buried-rule",
  schema: optionsSchema,

  run(ctx: RuleContext<Options>): RuleResult[] {
    const { attentionTokens } = optionsSchema.parse(ctx.options ?? {});
    const charThreshold = attentionTokens * CHARS_PER_TOKEN;

    const out: RuleResult[] = [];
    for (const rule of ctx.spec.extractedRules) {
      if (rule.kind !== "binding") continue;
      const offset = rule.range.start.offset;
      if (typeof offset !== "number") continue;
      if (offset < charThreshold) continue;

      out.push({
        ruleId: "tokens/buried-rule",
        severity: "warning",
        message: `Binding rule sits past the attention threshold (~${attentionTokens} tokens). Move it up or pare preceding content.`,
        range: rule.range,
        data: { offset, attentionTokens },
      });
    }
    return out;
  },
};
