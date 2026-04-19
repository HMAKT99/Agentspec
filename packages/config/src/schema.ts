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

export const providerSchema = z.enum(["anthropic", "openai", "google"]);

export const pricingSchema = z
  .object({
    inputPerMillion: z.number().nonnegative(),
    outputPerMillion: z.number().nonnegative(),
  })
  .strict();

export const modelObjectSchema = z
  .object({
    id: z.string().min(1).optional(),
    provider: providerSchema,
    modelId: z.string().min(1),
    pricing: pricingSchema.optional(),
    maxOutputTokens: z.number().int().positive().optional(),
  })
  .strict();

// Accept either a short "provider:modelId" string or a full object.
export const modelEntrySchema = z.union([z.string().min(1), modelObjectSchema]);

export const configSchema = z
  .object({
    specs: z.array(specInputSchema).default([
      // Canonical / Claude-family
      { path: "CLAUDE.md", binding: "primary" },
      { path: "AGENTS.md", binding: "primary" },
      { path: "GEMINI.md", binding: "secondary" },
      // GitHub Copilot (repo + CLI + custom agents)
      { path: ".github/copilot-instructions.md", binding: "primary" },
      { path: ".github/copilot-cli-instructions.md", binding: "secondary" },
      { path: "**/*.agent.md", binding: "secondary" },
      // Cursor
      { path: ".cursorrules", binding: "primary" },
      { path: ".cursor/rules/**/*.mdc", binding: "primary" },
      // Windsurf / Cline / Aider
      { path: ".windsurfrules", binding: "primary" },
      { path: ".clinerules", binding: "primary" },
      { path: ".aider.md", binding: "secondary" },
      { path: ".aider-instructions.md", binding: "secondary" },
      // MCP tool specs
      { path: "**/*.mcp.md", binding: "tool-spec" },
    ]),
    rules: z.record(z.string(), severitySchema).default({}),
    ruleOptions: z.record(z.string(), z.unknown()).default({}),
    budgets: budgetsSchema.default({}),
    models: z.array(modelEntrySchema).default([]),
    behaviorTests: behaviorTestsSchema.default({}),
    score: scoreSchema.default({}),
  })
  .strict();

export type MdpactConfig = z.infer<typeof configSchema>;
export type MdpactConfigInput = z.input<typeof configSchema>;
