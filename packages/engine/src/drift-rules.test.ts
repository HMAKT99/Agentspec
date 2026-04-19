import { parseSpec } from "@agentspec/core";
import { describe, expect, it } from "vitest";

import { createDriftRules } from "./drift-rules.js";
import type { BehaviorReport, Outcome, RunRecord, Task } from "./types.js";

function run(task: Task, outcome: Outcome, runIndex = 0): RunRecord {
  return {
    task,
    model: "mock/A",
    modelVersion: "test",
    run: runIndex,
    outcome,
    response: {
      text: "",
      inputTokens: 0,
      outputTokens: 0,
      modelVersion: "test",
    },
    costUsd: 0,
    fromCache: false,
  };
}

function report(runs: RunRecord[]): BehaviorReport {
  return {
    runs,
    perTask: [],
    perModel: [],
    totals: { runs: runs.length, cachedHits: 0, costUsd: 0, durationMs: 0 },
    budgetExceeded: false,
  };
}

describe("createDriftRules", () => {
  const spec = parseSpec(
    "CLAUDE.md",
    "---\nversion: 1\nowner: team\n---\n\n- You must always commit before pushing.\n",
  );

  it("fires when a tagged task's adherence is below threshold", () => {
    const task: Task = {
      name: "commit-test",
      prompt: "push my branch",
      tags: ["commit-before-push"],
    };
    // 4 runs: 1 acted, 3 deviated → 25% adherence
    const runs: RunRecord[] = [
      run(task, "acted", 0),
      run(task, "deviated", 1),
      run(task, "deviated", 2),
      run(task, "deviated", 3),
    ];
    const [drift] = createDriftRules(report(runs), { adherenceThreshold: 0.7 });
    const results = drift!.run({
      spec,
      allSpecs: [spec],
      options: {},
    });
    expect(results.length).toBe(1);
    expect(results[0]!.ruleId).toBe("behavior/drift");
    expect(results[0]!.message).toContain("commit-before-push");
    expect(results[0]!.message).toContain("25%");
  });

  it("stays silent when adherence meets the threshold", () => {
    const task: Task = {
      name: "commit-test",
      prompt: "push my branch",
      tags: ["commit-before-push"],
    };
    // 4 runs: 4 acted → 100% adherence
    const runs: RunRecord[] = [
      run(task, "acted", 0),
      run(task, "acted", 1),
      run(task, "acted", 2),
      run(task, "acted", 3),
    ];
    const [drift] = createDriftRules(report(runs), { adherenceThreshold: 0.7 });
    const results = drift!.run({ spec, allSpecs: [spec], options: {} });
    expect(results).toEqual([]);
  });

  it("ignores tags with too few runs", () => {
    const task: Task = {
      name: "rare-test",
      prompt: "rare",
      tags: ["rare-topic"],
    };
    const runs: RunRecord[] = [run(task, "deviated", 0), run(task, "deviated", 1)];
    const [drift] = createDriftRules(report(runs), {
      adherenceThreshold: 0.7,
      minRunsPerTag: 3,
    });
    const results = drift!.run({ spec, allSpecs: [spec], options: {} });
    expect(results).toEqual([]);
  });

  it("anchors the finding to a binding rule whose text matches the tag", () => {
    const task: Task = {
      name: "commit-test",
      prompt: "push",
      tags: ["commit"],
    };
    const runs: RunRecord[] = [
      run(task, "deviated", 0),
      run(task, "deviated", 1),
      run(task, "deviated", 2),
    ];
    const [drift] = createDriftRules(report(runs), { adherenceThreshold: 0.7 });
    const results = drift!.run({ spec, allSpecs: [spec], options: {} });
    expect(results.length).toBe(1);
    // The binding rule "You must always commit before pushing." is around line 6.
    expect(results[0]!.range.start.line).toBeGreaterThan(1);
  });

  it("falls back to line 1 when no matching spec rule is found", () => {
    const task: Task = {
      name: "unrelated",
      prompt: "do something else",
      tags: ["unrelated-topic-not-in-spec"],
    };
    const runs: RunRecord[] = [
      run(task, "deviated", 0),
      run(task, "deviated", 1),
      run(task, "deviated", 2),
    ];
    const [drift] = createDriftRules(report(runs), { adherenceThreshold: 0.7 });
    const results = drift!.run({ spec, allSpecs: [spec], options: {} });
    expect(results.length).toBe(1);
    expect(results[0]!.range.start.line).toBe(1);
  });
});
