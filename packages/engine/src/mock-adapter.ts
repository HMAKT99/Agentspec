import type { CallOpts, ModelAdapter, ModelResponse } from "./types.js";

export interface MockAdapterOptions {
  id?: string;
  modelVersion?: string;
  /**
   * If supplied, used verbatim as the response text.
   * Otherwise a deterministic string is produced from the prompt.
   */
  respond?: (system: string, user: string, opts: CallOpts) => string;
  /** Input token rate (USD per 1M tokens). Default 1. */
  inputRate?: number;
  /** Output token rate (USD per 1M tokens). Default 1. */
  outputRate?: number;
  /** Artificial delay per call in ms. Default 0. */
  latencyMs?: number;
}

export class MockAdapter implements ModelAdapter {
  readonly id: string;
  readonly modelVersion: string;
  private readonly respond: (system: string, user: string, opts: CallOpts) => string;
  private readonly inputRate: number;
  private readonly outputRate: number;
  private readonly latencyMs: number;

  constructor(opts: MockAdapterOptions = {}) {
    this.id = opts.id ?? "mock/deterministic";
    this.modelVersion = opts.modelVersion ?? "mock-2026-04-18";
    this.inputRate = opts.inputRate ?? 1;
    this.outputRate = opts.outputRate ?? 1;
    this.latencyMs = opts.latencyMs ?? 0;
    this.respond = opts.respond ?? defaultRespond;
  }

  async call(system: string, user: string, opts: CallOpts = {}): Promise<ModelResponse> {
    if (this.latencyMs > 0) await delay(this.latencyMs);
    if (opts.signal?.aborted) throw new Error("aborted");

    const text = this.respond(system, user, opts);
    const inputTokens = this.tokenize(system) + this.tokenize(user);
    const outputTokens = this.tokenize(text);

    return {
      text,
      inputTokens,
      outputTokens,
      modelVersion: this.modelVersion,
      stopReason: "end_turn",
    };
  }

  tokenize(text: string): number {
    return Math.ceil(text.length / 4);
  }

  costUsd(tokens: { in: number; out: number }): number {
    return (tokens.in / 1_000_000) * this.inputRate + (tokens.out / 1_000_000) * this.outputRate;
  }
}

function defaultRespond(_system: string, user: string, opts: CallOpts): string {
  const tag = opts.seed !== undefined ? `seed=${opts.seed}` : "seed=default";
  return `[mock ${tag}] Acknowledging task: ${user.slice(0, 200)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
