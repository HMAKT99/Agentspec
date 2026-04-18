import { NullCache } from "./cache.js";
import { HeuristicClassifier } from "./classifier.js";
import type {
  BehaviorReport,
  CacheProvider,
  ModelAdapter,
  Outcome,
  OutcomeClassifier,
  PerModelMetrics,
  PerTaskMetrics,
  PredictInput,
  RunRecord,
  Task,
} from "./types.js";

export class BudgetExceededError extends Error {
  constructor(
    readonly spentUsd: number,
    readonly budgetUsd: number,
  ) {
    super(
      `Behavior run aborted: spent $${spentUsd.toFixed(4)} of $${budgetUsd.toFixed(4)} budget.`,
    );
    this.name = "BudgetExceededError";
  }
}

export async function predictBehavior(input: PredictInput): Promise<BehaviorReport> {
  const started = performance.now();
  const cache: CacheProvider = input.cache ?? new NullCache();
  const classifier: OutcomeClassifier = input.classifier ?? new HeuristicClassifier();

  const runs: RunRecord[] = [];
  let costUsd = 0;
  let cachedHits = 0;
  let budgetExceeded = false;

  outer: for (const task of input.tasks) {
    for (const adapter of input.adapters) {
      for (let run = 0; run < input.runs; run++) {
        if (input.signal?.aborted) break outer;

        const key = {
          spec: input.spec,
          task: `${task.name}\n${task.prompt}`,
          model: adapter.id,
          modelVersion: adapter.modelVersion,
          run,
        };

        let cached = await cache.get(key);
        if (cached) {
          cachedHits += 1;
          runs.push({
            task,
            model: adapter.id,
            modelVersion: cached.response.modelVersion,
            run,
            outcome: cached.outcome,
            response: cached.response,
            costUsd: 0,
            fromCache: true,
            ...(cached.classifierNotes !== undefined
              ? { classifierNotes: cached.classifierNotes }
              : {}),
          });
          continue;
        }

        const response = await adapter.call(input.spec, task.prompt, { seed: run });
        const thisCost = adapter.costUsd({ in: response.inputTokens, out: response.outputTokens });

        if (input.budget && costUsd + thisCost > input.budget.usdMax) {
          budgetExceeded = true;
          break outer;
        }

        costUsd += thisCost;
        const { outcome, notes } = await classifier.classify({ task, response });

        const record: RunRecord = {
          task,
          model: adapter.id,
          modelVersion: response.modelVersion,
          run,
          outcome,
          response,
          costUsd: thisCost,
          fromCache: false,
          ...(notes !== undefined ? { classifierNotes: notes } : {}),
        };
        runs.push(record);

        cached = {
          response,
          outcome,
          cachedAt: new Date().toISOString(),
          ...(notes !== undefined ? { classifierNotes: notes } : {}),
        };
        await cache.set(key, cached);
      }
    }
  }

  return {
    runs,
    perTask: computePerTask(runs, input.tasks),
    perModel: computePerModel(runs, input.adapters),
    totals: {
      runs: runs.length,
      cachedHits,
      costUsd,
      durationMs: performance.now() - started,
    },
    budgetExceeded,
  };
}

function computePerTask(runs: RunRecord[], tasks: Task[]): PerTaskMetrics[] {
  return tasks.map((task) => {
    const mine = runs.filter((r) => r.task.name === task.name);
    const outcomes = zeroOutcomes();
    for (const r of mine) outcomes[r.outcome] += 1;

    const modelOutcomes = new Map<string, Outcome>();
    for (const r of mine) {
      if (!modelOutcomes.has(r.model)) modelOutcomes.set(r.model, r.outcome);
    }
    const distinct = new Set(modelOutcomes.values()).size;
    const divergenceAcrossModels =
      modelOutcomes.size === 0 ? 0 : (distinct - 1) / Math.max(1, modelOutcomes.size);

    const adherence = mine.length === 0 ? 1 : outcomes.acted / mine.length;

    return {
      task: task.name,
      total: mine.length,
      outcomes,
      divergenceAcrossModels,
      adherence,
    };
  });
}

function computePerModel(runs: RunRecord[], adapters: ModelAdapter[]): PerModelMetrics[] {
  return adapters.map((adapter) => {
    const mine = runs.filter((r) => r.model === adapter.id);
    const outcomes = zeroOutcomes();
    for (const r of mine) outcomes[r.outcome] += 1;

    const taskDistinct = new Map<string, Set<Outcome>>();
    for (const r of mine) {
      const bag = taskDistinct.get(r.task.name) ?? new Set<Outcome>();
      bag.add(r.outcome);
      taskDistinct.set(r.task.name, bag);
    }
    const variance =
      taskDistinct.size === 0
        ? 0
        : [...taskDistinct.values()].reduce((acc, bag) => acc + (bag.size - 1), 0) /
          taskDistinct.size;

    return {
      model: adapter.id,
      total: mine.length,
      outcomes,
      intraModelVariance: variance,
    };
  });
}

function zeroOutcomes(): Record<Outcome, number> {
  return { refused: 0, clarified: 0, acted: 0, deviated: 0 };
}
