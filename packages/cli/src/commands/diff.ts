import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { promisify } from "node:util";
import { ConfigError, type MdpactConfig, loadConfig } from "@mdpact/config";
import { type LintReport, type RuleResult, lint, parseSpec } from "@mdpact/core";
import { allRules } from "@mdpact/rules";
import { defineCommand } from "citty";
import pc from "picocolors";

import { toLintConfig } from "../lib/config-to-lint.js";
import { loadSpecs } from "../lib/load-specs.js";

const run = promisify(execFile);

export const diffCommand = defineCommand({
  meta: {
    name: "diff",
    description: "Compare lint + score against a git ref (rule-level only in v1)",
  },
  args: {
    ref: {
      type: "positional",
      required: false,
      description: "Git ref to compare against (default: main)",
      default: "main",
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
      description: "Output format: markdown | json",
      default: "markdown",
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

    const { specs: currentSpecs, paths } = await loadSpecs(cwd, config);
    if (currentSpecs.length === 0) {
      process.stderr.write("No spec files matched.\n");
      process.exit(1);
    }

    const baseSpecs = await Promise.all(
      paths.map(async (p) => {
        const rel = relative(cwd, p);
        const raw = await loadAtRef(cwd, args.ref, rel);
        return raw !== null ? parseSpec(p, raw) : null;
      }),
    );

    const currentReport = lint({
      specs: currentSpecs,
      rules: allRules,
      config: toLintConfig(config),
    });
    const baseReport = lint({
      specs: baseSpecs.filter((s): s is NonNullable<typeof s> => s !== null),
      rules: allRules,
      config: toLintConfig(config),
    });

    const diff = buildDiff(baseReport, currentReport);

    if (args.format === "json") {
      process.stdout.write(`${JSON.stringify(diff, null, 2)}\n`);
    } else {
      process.stdout.write(renderMarkdown(diff, args.ref));
    }

    if (diff.fixed.length === 0 && diff.introduced.length === 0) process.exit(0);
    // Surface with exit 1 if new issues were introduced.
    process.exit(diff.introduced.length > 0 ? 1 : 0);
  },
});

async function loadAtRef(cwd: string, ref: string, relPath: string): Promise<string | null> {
  try {
    const { stdout } = await run("git", ["-C", cwd, "show", `${ref}:${relPath}`], {
      maxBuffer: 10 * 1024 * 1024,
    });
    return stdout;
  } catch {
    return null;
  }
}

interface DiffBuckets {
  introduced: RuleResult[];
  fixed: RuleResult[];
  unchanged: RuleResult[];
}

function buildDiff(base: LintReport, current: LintReport): DiffBuckets {
  const keyOf = (r: RuleResult) =>
    `${r.ruleId}|${r.message}|${r.range.start.line}:${r.range.start.column}`;

  const baseSet = new Map<string, RuleResult>();
  for (const r of base.results) baseSet.set(keyOf(r), r);

  const introduced: RuleResult[] = [];
  const unchanged: RuleResult[] = [];

  for (const r of current.results) {
    const k = keyOf(r);
    if (baseSet.has(k)) {
      unchanged.push(r);
      baseSet.delete(k);
    } else {
      introduced.push(r);
    }
  }

  const fixed = [...baseSet.values()];
  return { introduced, fixed, unchanged };
}

function renderMarkdown(diff: DiffBuckets, ref: string): string {
  const out: string[] = [];
  out.push(`# mdpact diff vs \`${ref}\``);
  out.push("");

  out.push(
    `**Introduced:** ${diff.introduced.length}  **Fixed:** ${diff.fixed.length}  **Unchanged:** ${diff.unchanged.length}`,
  );
  out.push("");

  if (diff.introduced.length > 0) {
    out.push("## Introduced");
    for (const r of diff.introduced) out.push(bullet(r));
    out.push("");
  }

  if (diff.fixed.length > 0) {
    out.push("## Fixed");
    for (const r of diff.fixed) out.push(bullet(r));
    out.push("");
  }

  return `${out.join("\n")}\n`;
}

function bullet(r: RuleResult): string {
  const sev =
    r.severity === "error"
      ? pc.red(r.severity)
      : r.severity === "warning"
        ? pc.yellow(r.severity)
        : pc.cyan(r.severity);
  return `- \`${r.ruleId}\` ${sev} — ${r.message} (${r.range.start.file}:${r.range.start.line})`;
}
