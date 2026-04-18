import { z } from "zod";

export const severitySchema = z.enum(["error", "warning", "info", "off"]);

export const specInputSchema = z.object({
  path: z.string().min(1),
  binding: z.enum(["primary", "secondary", "tool-spec"]).optional(),
});

export const budgetsSchema = z
  .object({
    tokens: z.number().int().positive().optional(),
    behaviorTestUsdMax: z.number().positive().optional(),
  })
  .strict();

export const behaviorTestsSchema = z
  .object({
    path: z.string().optional(),
    runsPerTask: z.number().int().positive().optional(),
  })
  .strict();

export const scoreSchema = z
  .object({
    failBelow: z.number().int().min(0).max(100).optional(),
  })
  .strict();

export const configSchema = z
  .object({
    specs: z.array(specInputSchema).default([
      { path: "CLAUDE.md", binding: "primary" },
      { path: "AGENTS.md", binding: "secondary" },
    ]),
    rules: z.record(z.string(), severitySchema).default({}),
    ruleOptions: z.record(z.string(), z.unknown()).default({}),
    budgets: budgetsSchema.default({}),
    models: z.array(z.string()).default([]),
    behaviorTests: behaviorTestsSchema.default({}),
    score: scoreSchema.default({}),
  })
  .strict();

export type AgentSpecConfig = z.infer<typeof configSchema>;
export type AgentSpecConfigInput = z.input<typeof configSchema>;
