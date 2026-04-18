import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DiskCache } from "./cache.js";
import { HeuristicClassifier } from "./classifier.js";
import { MockAdapter } from "./mock-adapter.js";
import { predictBehavior } from "./predict.js";
import type { Task } from "./types.js";

const task: Task = {
  name: "echo",
  prompt: "Please confirm you can hear me.",
};

describe("predictBehavior", () => {
  it("runs tasks × models × runs", async () => {
    const adapterA = new MockAdapter({ id: "mock/A" });
    const adapterB = new MockAdapter({ id: "mock/B" });

    const report = await predictBehavior({
      spec: "# SPEC\nYou must reply briefly.",
      tasks: [task],
      adapters: [adapterA, adapterB],
      runs: 3,
    });

    expect(report.runs.length).toBe(6);
    expect(report.totals.runs).toBe(6);
    expect(report.perModel.length).toBe(2);
    expect(report.perTask.length).toBe(1);
  });

  it("uses the cache on a second call", async () => {
    let dir = "";
    try {
      dir = mkdtempSync(join(tmpdir(), "agentspec-cache-"));
      const cache = new DiskCache(dir);
      const adapter = new MockAdapter({ id: "mock/det" });

      const first = await predictBehavior({
        spec: "spec",
        tasks: [task],
        adapters: [adapter],
        runs: 2,
        cache,
      });
      expect(first.totals.cachedHits).toBe(0);

      const second = await predictBehavior({
        spec: "spec",
        tasks: [task],
        adapters: [adapter],
        runs: 2,
        cache,
      });
      expect(second.totals.cachedHits).toBe(2);
    } finally {
      if (dir) rmSync(dir, { recursive: true, force: true });
    }
  });

  it("classifies refusals via the heuristic classifier", async () => {
    const adapter = new MockAdapter({
      id: "mock/refuser",
      respond: () => "I cannot help with that request.",
    });

    const report = await predictBehavior({
      spec: "spec",
      tasks: [task],
      adapters: [adapter],
      runs: 1,
      classifier: new HeuristicClassifier(),
    });

    expect(report.runs[0]!.outcome).toBe("refused");
  });

  it("aborts when the budget is exceeded", async () => {
    const expensive = new MockAdapter({
      id: "mock/$$$",
      inputRate: 10_000_000,
      outputRate: 10_000_000,
    });
    const report = await predictBehavior({
      spec: "spec that is long enough to cost real money",
      tasks: [task, { ...task, name: "echo2" }],
      adapters: [expensive],
      runs: 5,
      budget: { usdMax: 0.01 },
    });

    expect(report.budgetExceeded).toBe(true);
    expect(report.totals.runs).toBeLessThan(10);
  });
});
