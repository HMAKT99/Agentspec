import { resolve } from "node:path";
import { type AgentSpecConfig, ConfigError, loadConfig } from "@agentspec/config";
import { lint } from "@agentspec/core";
import { allRules } from "@agentspec/rules";
import { defineCommand } from "citty";

import { type OutputFormat, renderReport } from "../format/index.js";
import { toLintConfig } from "../lib/config-to-lint.js";
import { loadSpecs } from "../lib/load-specs.js";

const VALID_FORMATS: OutputFormat[] = ["pretty", "json", "github"];

export const lintCommand = defineCommand({
  meta: {
    name: "lint",
    description: "Lint agent spec files for conflicts, clarity, and structural issues",
  },
  args: {
    paths: {
      type: "positional",
      required: false,
      description: "File paths or globs to lint (defaults to config.specs)",
    },
    format: {
      type: "string",
      description: "Output format: pretty | json | github",
      default: "pretty",
    },
    config: {
      type: "string",
      description: "Path to agentspec config file",
    },
    cwd: {
      type: "string",
      description: "Working directory",
      default: process.cwd(),
    },
    "max-warnings": {
      type: "string",
      description: "Exit with code 2 if warnings exceed this count",
    },
  },
  async run({ args }) {
    const cwd = resolve(args.cwd);
    const format = parseFormat(args.format);

    let config: AgentSpecConfig;
    try {
      ({ config } = await loadConfig(cwd, args.config));
    } catch (err) {
      if (err instanceof ConfigError) {
        process.stderr.write(`${err.message}\n`);
        process.exit(2);
      }
      throw err;
    }

    const explicit = collectPatterns(args.paths);
    const { specs } = await loadSpecs(cwd, config, explicit);

    if (specs.length === 0) {
      const hint =
        explicit.length > 0 ? explicit.join(", ") : config.specs.map((s) => s.path).join(", ");
      process.stderr.write(`No spec files matched: ${hint}\n`);
      process.exit(1);
    }

    const report = lint({ specs, rules: allRules, config: toLintConfig(config) });
    process.stdout.write(renderReport(report, format));

    if (report.errorCount > 0) process.exit(1);

    const maxWarnings = parseMaxWarnings(args["max-warnings"]);
    if (maxWarnings !== null && report.warningCount > maxWarnings) process.exit(2);

    process.exit(0);
  },
});

function parseFormat(raw: unknown): OutputFormat {
  if (typeof raw === "string" && (VALID_FORMATS as string[]).includes(raw)) {
    return raw as OutputFormat;
  }
  return "pretty";
}

function parseMaxWarnings(raw: unknown): number | null {
  if (typeof raw !== "string") return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

function collectPatterns(raw: unknown): string[] {
  if (typeof raw === "string" && raw.length > 0) return [raw];
  if (Array.isArray(raw) && raw.length > 0)
    return raw.filter((s): s is string => typeof s === "string");
  return [];
}
