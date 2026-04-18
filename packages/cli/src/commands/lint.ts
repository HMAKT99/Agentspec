import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { lint, parseSpec } from "@agentspec/core";
import { allRules } from "@agentspec/rules";
import { defineCommand } from "citty";
import { glob } from "tinyglobby";

import { renderJson, renderPretty } from "../format/index.js";

export const lintCommand = defineCommand({
  meta: {
    name: "lint",
    description: "Lint agent spec files for conflicts, clarity, and structural issues",
  },
  args: {
    paths: {
      type: "positional",
      required: false,
      description: "File paths or globs to lint (defaults to CLAUDE.md, AGENTS.md)",
    },
    format: {
      type: "string",
      description: "Output format: pretty | json",
      default: "pretty",
    },
    cwd: {
      type: "string",
      description: "Working directory",
      default: process.cwd(),
    },
  },
  async run({ args }) {
    const cwd = resolve(args.cwd);
    const patterns = collectPatterns(args.paths);

    const files = await glob(patterns, {
      cwd,
      absolute: true,
      onlyFiles: true,
      ignore: ["**/node_modules/**", "**/dist/**", "**/.turbo/**"],
    });

    if (files.length === 0) {
      process.stderr.write(`No files matched: ${patterns.join(", ")}\n`);
      process.exit(1);
    }

    const specs = await Promise.all(
      files.map(async (file) => {
        const raw = await readFile(file, "utf8");
        return parseSpec(file, raw);
      }),
    );

    const report = lint({ specs, rules: allRules });

    if (args.format === "json") {
      process.stdout.write(renderJson(report));
      process.stdout.write("\n");
    } else {
      process.stdout.write(renderPretty(report));
    }

    if (report.errorCount > 0) process.exit(1);
    process.exit(0);
  },
});

function collectPatterns(raw: unknown): string[] {
  if (typeof raw === "string" && raw.length > 0) return [raw];
  if (Array.isArray(raw) && raw.length > 0)
    return raw.filter((s): s is string => typeof s === "string");
  return ["CLAUDE.md", "AGENTS.md"];
}
