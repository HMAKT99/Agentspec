export type ModelRef = string;

export type Outcome = "refused" | "clarified" | "acted" | "deviated";

export interface TaskExpected {
  shouldAct?: boolean | undefined;
  shouldMention?: string[] | undefined;
  shouldNotMention?: string[] | undefined;
  shouldAsk?: boolean | undefined;
}

export interface Task {
  name: string;
  prompt: string;
  expected?: TaskExpected | undefined;
  tags?: string[] | undefined;
}

export interface CallOpts {
  seed?: number;
  maxOutputTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
}

export interface ModelResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
  modelVersion: string;
  stopReason?: string;
}

export interface ModelAdapter {
  id: ModelRef;
  /** Stable identifier for the underlying model revision. Used as part of the cache key. */
  modelVersion: string;
  call(system: string, user: string, opts?: CallOpts): Promise<ModelResponse>;
  tokenize(text: string): number;
  costUsd(tokens: { in: number; out: number }): number;
}

export interface CacheKey {
  spec: string;
  task: string;
  model: string;
  modelVersion: string;
  run: number;
}

export interface CachedEntry {
  response: ModelResponse;
  outcome: Outcome;
  classifierNotes?: string;
  cachedAt: string;
}

export interface CacheProvider {
  get(key: CacheKey): Promise<CachedEntry | null>;
  set(key: CacheKey, value: CachedEntry): Promise<void>;
}

export interface OutcomeClassifier {
  classify(input: {
    task: Task;
    response: ModelResponse;
  }): Promise<{ outcome: Outcome; notes?: string }>;
}

export interface RunRecord {
  task: Task;
  model: ModelRef;
  modelVersion: string;
  run: number;
  outcome: Outcome;
  response: ModelResponse;
  costUsd: number;
  fromCache: boolean;
  classifierNotes?: string;
}

export interface PerTaskMetrics {
  task: string;
  total: number;
  outcomes: Record<Outcome, number>;
  divergenceAcrossModels: number;
  adherence: number;
}

export interface PerModelMetrics {
  model: ModelRef;
  total: number;
  outcomes: Record<Outcome, number>;
  intraModelVariance: number;
}

export interface BehaviorReport {
  runs: RunRecord[];
  perTask: PerTaskMetrics[];
  perModel: PerModelMetrics[];
  totals: {
    runs: number;
    cachedHits: number;
    costUsd: number;
    durationMs: number;
  };
  budgetExceeded: boolean;
}

export interface PredictInput {
  spec: string;
  tasks: Task[];
  adapters: ModelAdapter[];
  runs: number;
  cache?: CacheProvider;
  classifier?: OutcomeClassifier;
  budget?: { usdMax: number };
  signal?: AbortSignal;
}
