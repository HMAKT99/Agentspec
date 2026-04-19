import { resolve } from "node:path";
import { ConfigError, type MdpactConfig, loadConfig } from "@mdpact/config";
import { lint } from "@mdpact/core";
import { allRules } from "@mdpact/rules";
import { defineCommand } from "citty";
import pc from "picocolors";

import { toLintConfig } from "../lib/config-to-lint.js";
import { loadSpecs } from "../lib/load-specs.js";
import { computeScore } from "../lib/score.js";

export const scoreCommand = defineCommand({
  meta: {
    name: "score",
    description: "Compute a static score for the current spec state",
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
      description: "Path to mdpact config file",
    },
    format: {
      type: "string",
      description: "Output format: pretty | json",
      default: "pretty",
    },
    threshold: {
      type: "string",
      description: "Override config.score.failBelow",
    },
  },
  async run({ args }) {
    const cwd = resolve(args.cwd);

    let config: MdpactConfig;
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

    const report = lint({ specs, rules: allRules, config: toLintConfig(config) });
    const breakdown = computeScore(report, config);

    if (args.format === "json") {
      process.stdout.write(`${JSON.stringify(breakdown, null, 2)}\n`);
    } else {
      process.stdout.write(renderScore(breakdown));
    }

    const threshold = parseThreshold(args.threshold, config.score.failBelow);
    if (typeof threshold === "number" && breakdown.total < threshold) {
      process.exit(1);
    }
    process.exit(0);
  },
});

function renderScore(b: ReturnType<typeof computeScore>): string {
  const color = b.total >= 80 ? pc.green : b.total >= 60 ? pc.yellow : pc.red;

  const lines = [
    pc.bold(`Score: ${color(`${b.total}/100`)}`),
    "",
    `  base                ${pc.dim("100")}`,
    `  errors × ${b.errors.count.toString().padStart(3)}     ${formatDelta(b.errors.delta)}`,
    `  warnings × ${b.warnings.count.toString().padStart(3)}   ${formatDelta(b.warnings.delta)}`,
    `  info × ${b.infos.count.toString().padStart(3)}       ${formatDelta(b.infos.delta)}`,
    `  token budget       ${b.tokenBudget.exceeded ? formatDelta(b.tokenBudget.delta) : pc.dim("ok")}`,
    `  frontmatter        ${b.frontmatter.missing ? formatDelta(b.frontmatter.delta) : pc.dim("ok")}`,
    `  empty spec         ${b.emptySpec.fired ? pc.red(`cap ${b.emptySpec.cap}`) : pc.dim("ok")}`,
  ];

  return `${lines.join("\n")}\n`;
}

function formatDelta(n: number): string {
  if (n === 0) return pc.dim("0");
  return pc.red(n.toString());
}

function collectPatterns(raw: unknown): string[] {
  if (typeof raw === "string" && raw.length > 0) return [raw];
  if (Array.isArray(raw) && raw.length > 0)
    return raw.filter((s): s is string => typeof s === "string");
  return [];
}

function parseThreshold(flag: unknown, fallback?: number): number | undefined {
  if (typeof flag === "string") {
    const n = Number.parseInt(flag, 10);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}
