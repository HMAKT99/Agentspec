import type { Rule, RuleContext, RuleResult } from "@agentspec/core";
import { z } from "zod";

const optionsSchema = z
  .object({
    allowed: z.array(z.string()).default([]),
    detect: z
      .array(z.string())
      .default([
        "git",
        "gh",
        "npm",
        "pnpm",
        "yarn",
        "node",
        "tsc",
        "biome",
        "prettier",
        "eslint",
        "rg",
        "grep",
        "sed",
        "awk",
        "jq",
        "curl",
        "wget",
        "docker",
        "kubectl",
        "aws",
        "gcloud",
        "terraform",
        "psql",
        "mysql",
        "redis-cli",
        "bq",
      ]),
  })
  .strict();

type Options = z.infer<typeof optionsSchema>;

export const unknownTool: Rule<Options> = {
  id: "tools/unknown-tool",
  severity: "warning",
  description: "A backticked tool is referenced but not in the declared allowed list.",
  category: "tools",
  fixable: false,
  docsUrl: "https://agentspec.dev/rules/tools/unknown-tool",
  schema: optionsSchema,

  run(ctx: RuleContext<Options>): RuleResult[] {
    const { allowed, detect } = optionsSchema.parse(ctx.options ?? {});
    // Opt-in: without a declared allow list there is no policy to enforce.
    if (allowed.length === 0) return [];
    const allowedSet = new Set(allowed);
    const detectSet = new Set(detect);
    const seen = new Set<string>();
    const out: RuleResult[] = [];

    for (const ref of ctx.spec.inlineCode) {
      const firstToken = ref.text.trim().split(/\s+/)[0]?.toLowerCase();
      if (!firstToken) continue;
      if (!detectSet.has(firstToken)) continue;
      if (allowedSet.has(firstToken)) continue;

      const key = `${firstToken}@${ref.range.start.line}:${ref.range.start.column}`;
      if (seen.has(key)) continue;
      seen.add(key);

      out.push({
        ruleId: "tools/unknown-tool",
        severity: "warning",
        message: `Tool "${firstToken}" is referenced but not in your \`tools/unknown-tool.allowed\` list.`,
        range: ref.range,
        data: { tool: firstToken, snippet: ref.text },
      });
    }
    return out;
  },
};
