import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { promisify } from "node:util";

import * as core from "@actions/core";
import * as github from "@actions/github";
import { type AgentSpecConfig, ConfigError, loadConfig } from "@agentspec/config";
import { type LintReport, type ParsedSpec, lint, parseSpec } from "@agentspec/core";
import { allRules } from "@agentspec/rules";
import { glob } from "tinyglobby";

import { upsertStickyComment } from "./comment.js";
import { computeScore } from "./score.js";

const run = promisify(execFile);

async function main(): Promise<void> {
  const cwd = process.env.GITHUB_WORKSPACE ?? process.cwd();
  const configPath = optionalInput("config");
  const failBelow = Number.parseInt(core.getInput("fail-below") || "70", 10);
  const postComment = (core.getInput("comment") || "true") === "true";
  const token = core.getInput("github-token");

  let config: AgentSpecConfig;
  try {
    ({ config } = await loadConfig(cwd, configPath));
  } catch (err) {
    if (err instanceof ConfigError) {
      core.setFailed(err.message);
      return;
    }
    throw err;
  }

  const currentSpecs = await discoverSpecs(
    cwd,
    config.specs.map((s) => s.path),
  );
  if (currentSpecs.length === 0) {
    core.warning("No spec files matched the patterns in agentspec.config — nothing to lint.");
    return;
  }

  const report = lint({ specs: currentSpecs, rules: allRules });
  emitAnnotations(report, cwd);

  const score = computeScore(report, config);
  const delta = await computeBaseDelta(
    cwd,
    config.specs.map((s) => s.path),
    failBelow,
  );

  core.setOutput("score", String(score.total));
  core.setOutput("errors", String(report.errorCount));
  core.setOutput("warnings", String(report.warningCount));

  if (postComment && github.context.payload.pull_request && token) {
    await upsertStickyComment(token, {
      report,
      score,
      delta,
      failBelow,
    });
  }

  if (score.total < failBelow) {
    core.setFailed(`Score ${score.total}/100 is below fail-below threshold ${failBelow}.`);
    return;
  }

  if (report.errorCount > 0) {
    core.setFailed(`${report.errorCount} error-severity diagnostic(s) reported.`);
  }
}

function optionalInput(name: string): string | undefined {
  const v = core.getInput(name);
  return v && v.length > 0 ? v : undefined;
}

async function discoverSpecs(cwd: string, patterns: string[]): Promise<ParsedSpec[]> {
  const files = await glob(patterns, {
    cwd: resolve(cwd),
    absolute: true,
    onlyFiles: true,
    ignore: ["**/node_modules/**", "**/dist/**", "**/.turbo/**"],
  });

  return Promise.all(
    files.map(async (file) => {
      const raw = await readFile(file, "utf8");
      return parseSpec(file, raw);
    }),
  );
}

function emitAnnotations(report: LintReport, cwd: string): void {
  for (const r of report.results) {
    const file = relative(cwd, r.range.start.file) || r.range.start.file;
    const properties = {
      file,
      startLine: r.range.start.line,
      startColumn: r.range.start.column,
      endLine: r.range.end.line,
      endColumn: r.range.end.column,
      title: r.ruleId,
    };
    if (r.severity === "error") core.error(r.message, properties);
    else if (r.severity === "warning") core.warning(r.message, properties);
    else core.notice(r.message, properties);
  }
}

interface BaseDelta {
  baseScore: number | null;
  ref: string;
}

async function computeBaseDelta(
  cwd: string,
  patterns: string[],
  _failBelow: number,
): Promise<BaseDelta> {
  const ref = github.context.payload.pull_request?.base?.ref ?? "main";
  try {
    await run("git", ["-C", cwd, "fetch", "--depth=1", "origin", ref], {
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch {
    // Detached/shallow clones sometimes fail to fetch; fall through with null.
    return { baseScore: null, ref };
  }

  const specs: ParsedSpec[] = [];
  for (const p of patterns) {
    try {
      const { stdout } = await run("git", ["-C", cwd, "show", `origin/${ref}:${p}`], {
        maxBuffer: 10 * 1024 * 1024,
      });
      specs.push(parseSpec(resolve(cwd, p), stdout));
    } catch {
      // File may not exist at base — fine.
    }
  }

  if (specs.length === 0) return { baseScore: null, ref };

  const baseReport = lint({ specs, rules: allRules });
  const baseScore = computeScore(baseReport, { budgets: {} } as never);
  return { baseScore: baseScore.total, ref };
}

export type { BaseDelta };

main().catch((err) => {
  core.setFailed(err instanceof Error ? err.message : String(err));
});
