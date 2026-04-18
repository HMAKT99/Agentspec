import { writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { type AgentSpecConfig, ConfigError, loadConfig } from "@agentspec/config";
import { type Fix, applyFixes, lint, type parseSpec } from "@agentspec/core";
import { allRules } from "@agentspec/rules";
import { defineCommand } from "citty";
import pc from "picocolors";

import { toLintConfig } from "../lib/config-to-lint.js";
import { loadSpecs } from "../lib/load-specs.js";

export const fixCommand = defineCommand({
  meta: {
    name: "fix",
    description: "Apply auto-fixable rule corrections in place (safe by default)",
  },
  args: {
    paths: {
      type: "positional",
      required: false,
      description: "File paths or globs (defaults to config.specs)",
    },
    cwd: {
      type: "string",
      description: "Working directory",
      default: process.cwd(),
    },
    config: {
      type: "string",
      description: "Path to agentspec config file",
    },
    unsafe: {
      type: "boolean",
      description: "Include rules marked as unsafe-fixable",
    },
    "dry-run": {
      type: "boolean",
      description: "Report what would change without writing files",
    },
  },
  async run({ args }) {
    const cwd = resolve(args.cwd);

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
      process.stderr.write("No spec files matched.\n");
      process.exit(1);
    }

    const lintConfig = toLintConfig(config);
    const fixableRules = allRules.filter((r) => {
      if (r.fixable === false || !r.fix) return false;
      if (r.fixable === "unsafe" && !args.unsafe) return false;
      return true;
    });

    if (fixableRules.length === 0) {
      process.stdout.write(
        args.unsafe
          ? "No fixable rules registered yet.\n"
          : "No safe-fixable rules registered. Re-run with --unsafe to include unsafe fixes.\n",
      );
      process.exit(0);
    }

    let totalApplied = 0;
    let totalSkipped = 0;
    let filesChanged = 0;

    for (const spec of specs) {
      const report = lint({ specs: [spec], rules: fixableRules, config: lintConfig });
      const fixes = collectFixes(spec, fixableRules, report);
      if (fixes.length === 0) continue;

      const { text, applied, skipped } = applyFixes(spec.raw, fixes);

      if (applied.length === 0) {
        for (const s of skipped) {
          process.stdout.write(`${pc.yellow("!")} ${spec.file}: ${s.reason}\n`);
        }
        continue;
      }

      const rel = relative(cwd, spec.file) || spec.file;
      totalApplied += applied.length;
      totalSkipped += skipped.length;
      filesChanged += 1;

      process.stdout.write(
        `${pc.green("✓")} ${rel}  ${pc.dim(`${applied.length} fix${applied.length === 1 ? "" : "es"}`)}\n`,
      );
      for (const f of applied) {
        process.stdout.write(`  ${pc.dim("•")} ${f.description}\n`);
      }
      for (const s of skipped) {
        process.stdout.write(`  ${pc.yellow("!")} skipped: ${s.reason}\n`);
      }

      if (!args["dry-run"]) {
        await writeFile(spec.file, text, "utf8");
      }
    }

    const verb = args["dry-run"] ? "would apply" : "applied";
    process.stdout.write(
      `\n${verb} ${totalApplied} fix${totalApplied === 1 ? "" : "es"} across ${filesChanged} file${filesChanged === 1 ? "" : "s"}${
        totalSkipped > 0 ? `, skipped ${totalSkipped}` : ""
      }.\n`,
    );

    if (args["dry-run"]) {
      process.stdout.write(pc.dim("(dry-run — no files written)\n"));
    }

    process.exit(0);
  },
});

function collectFixes(
  spec: ReturnType<typeof parseSpec>,
  rules: typeof allRules,
  report: ReturnType<typeof lint>,
): Fix[] {
  const out: Fix[] = [];
  const ruleById = new Map(rules.map((r) => [r.id, r]));
  for (const result of report.results) {
    const rule = ruleById.get(result.ruleId);
    if (!rule || !rule.fix) continue;
    const fix = rule.fix({ spec, allSpecs: [spec], options: {} }, result);
    if (fix) out.push(fix);
  }
  return out;
}

function collectPatterns(raw: unknown): string[] {
  if (typeof raw === "string" && raw.length > 0) return [raw];
  if (Array.isArray(raw) && raw.length > 0)
    return raw.filter((s): s is string => typeof s === "string");
  return [];
}
