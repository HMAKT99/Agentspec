import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { type AgentSpecConfig, ConfigError, loadConfig } from "@agentspec/config";
import {
  type BehaviorReport,
  DiskCache,
  HeuristicClassifier,
  NullCache,
  type Task,
  loadTaskFile,
  predictBehavior,
} from "@agentspec/engine";
import { defineCommand } from "citty";
import pc from "picocolors";

import { readFile } from "node:fs/promises";
import { resolveAdapters } from "../lib/resolve-adapters.js";

export const testCommand = defineCommand({
  meta: {
    name: "test",
    description: "Run behavior-prediction tests against declared models",
  },
  args: {
    cwd: {
      type: "string",
      description: "Working directory",
      default: process.cwd(),
    },
    config: {
      type: "string",
      description: "Path to agentspec config file",
    },
    spec: {
      type: "string",
      description: "Path to the spec file to test (default: first spec in config)",
    },
    tasks: {
      type: "string",
      description: "Path to tasks directory (default: config.behaviorTests.path)",
    },
    runs: {
      type: "string",
      description: "Runs per task × model (overrides config.behaviorTests.runsPerTask)",
    },
    "budget-usd": {
      type: "string",
      description: "Hard USD spend ceiling for this invocation (default: 1)",
    },
    models: {
      type: "string",
      description: "Comma-separated subset of models to run",
    },
    cache: {
      type: "boolean",
      description: "Cache responses under .agentspec/cache (enabled by default)",
      default: true,
    },
    format: {
      type: "string",
      description: "Output format: pretty | json",
      default: "pretty",
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

    if (config.models.length === 0) {
      process.stderr.write(
        "No models declared in agentspec.config — add entries under `models:` first.\n",
      );
      process.exit(1);
    }

    const modelFilter = parseList(args.models);
    const adapters = resolveAdapters(config, {
      ...(modelFilter.length > 0 ? { filter: modelFilter } : {}),
    });

    if (adapters.length === 0) {
      process.stderr.write(`No models matched --models filter: ${modelFilter.join(", ")}\n`);
      process.exit(1);
    }

    const specPath = resolve(cwd, args.spec ?? config.specs[0]?.path ?? "CLAUDE.md");
    const specText = await readFile(specPath, "utf8");

    const tasksDir = resolve(cwd, args.tasks ?? config.behaviorTests.path ?? "agentspec/tests");
    const tasks = await discoverTasks(tasksDir);

    if (tasks.length === 0) {
      process.stderr.write(`No task files found under ${tasksDir}.\n`);
      process.exit(1);
    }

    const runs = toInt(args.runs, config.behaviorTests.runsPerTask ?? 3);
    const budgetUsd = toFloat(args["budget-usd"], config.budgets.behaviorTestUsdMax ?? 1);

    const cache = args.cache ? new DiskCache(join(cwd, ".agentspec/cache")) : new NullCache();

    process.stdout.write(
      pc.dim(
        `Running ${tasks.length} task${tasks.length === 1 ? "" : "s"} × ${adapters.length} model${
          adapters.length === 1 ? "" : "s"
        } × ${runs} run${runs === 1 ? "" : "s"} (budget $${budgetUsd.toFixed(2)})…\n`,
      ),
    );

    const report = await predictBehavior({
      spec: specText,
      tasks,
      adapters,
      runs,
      cache,
      classifier: new HeuristicClassifier(),
      budget: { usdMax: budgetUsd },
    });

    if (args.format === "json") {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    } else {
      process.stdout.write(renderReport(report));
    }

    if (report.budgetExceeded) process.exit(1);
    process.exit(0);
  },
});

async function discoverTasks(dir: string): Promise<Task[]> {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return [];
  }

  const tasks: Task[] = [];
  for (const name of names) {
    if (!/\.(ya?ml|json)$/.test(name)) continue;
    tasks.push(await loadTaskFile(join(dir, name)));
  }
  return tasks;
}

function renderReport(report: BehaviorReport): string {
  const lines: string[] = [];
  lines.push(pc.bold("Behavior report"));
  lines.push("");

  lines.push(
    `${pc.dim("runs:")}        ${report.totals.runs}` +
      `   ${pc.dim("cached:")} ${report.totals.cachedHits}` +
      `   ${pc.dim("cost:")} $${report.totals.costUsd.toFixed(4)}` +
      `   ${pc.dim("duration:")} ${Math.round(report.totals.durationMs)}ms`,
  );
  if (report.budgetExceeded) {
    lines.push(pc.red("  ⚠ budget exceeded — run aborted early"));
  }
  lines.push("");

  lines.push(pc.bold("Per task"));
  for (const t of report.perTask) {
    const div = `${Math.round(t.divergenceAcrossModels * 100)}%`;
    lines.push(
      `  ${t.task.padEnd(24)} total=${t.total}   divergence=${div}   adherence=${Math.round(
        t.adherence * 100,
      )}%`,
    );
    lines.push(
      pc.dim(
        `    acted=${t.outcomes.acted} clarified=${t.outcomes.clarified} refused=${t.outcomes.refused} deviated=${t.outcomes.deviated}`,
      ),
    );
  }
  lines.push("");

  lines.push(pc.bold("Per model"));
  for (const m of report.perModel) {
    lines.push(
      `  ${m.model.padEnd(32)} total=${m.total}   variance=${m.intraModelVariance.toFixed(2)}`,
    );
    lines.push(
      pc.dim(
        `    acted=${m.outcomes.acted} clarified=${m.outcomes.clarified} refused=${m.outcomes.refused} deviated=${m.outcomes.deviated}`,
      ),
    );
  }

  return `${lines.join("\n")}\n`;
}

function parseList(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toInt(raw: unknown, fallback: number): number {
  if (typeof raw === "string") {
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function toFloat(raw: unknown, fallback: number): number {
  if (typeof raw === "string") {
    const n = Number.parseFloat(raw);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}
