import Anthropic from "@anthropic-ai/sdk";

import type { CallOpts, ModelAdapter, ModelResponse } from "../types.js";
import { type Pricing, computeCost, lookupPricing } from "./pricing.js";

export interface AnthropicAdapterOptions {
  modelId: string;
  apiKey?: string;
  client?: Anthropic;
  pricing?: Pricing;
  maxOutputTokens?: number;
}

export class AnthropicAdapter implements ModelAdapter {
  readonly id: string;
  readonly modelVersion: string;
  private readonly client: Anthropic;
  private readonly modelId: string;
  private readonly pricing: Pricing;
  private readonly maxOutputTokens: number;

  constructor(opts: AnthropicAdapterOptions) {
    this.modelId = opts.modelId;
    this.id = `anthropic/${opts.modelId}`;
    this.modelVersion = opts.modelId;
    this.pricing = opts.pricing ?? lookupPricing(opts.modelId);
    this.maxOutputTokens = opts.maxOutputTokens ?? 1024;
    this.client =
      opts.client ??
      new Anthropic({
        ...(opts.apiKey !== undefined ? { apiKey: opts.apiKey } : {}),
      });
  }

  async call(system: string, user: string, opts: CallOpts = {}): Promise<ModelResponse> {
    const response = await this.client.messages.create(
      {
        model: this.modelId,
        system,
        messages: [{ role: "user", content: user }],
        max_tokens: opts.maxOutputTokens ?? this.maxOutputTokens,
        ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
      },
      opts.signal ? { signal: opts.signal } : undefined,
    );

    const text = response.content
      .map((block) => ("text" in block ? block.text : ""))
      .join("")
      .trim();

    return {
      text,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      modelVersion: this.modelId,
      ...(response.stop_reason ? { stopReason: response.stop_reason } : {}),
    };
  }

  tokenize(text: string): number {
    // SDK does not expose offline tokenization for Claude 4.X. Approximate at
    // ~4 chars/token; callers should rely on the real input/output counts
    // returned by the API for anything that affects billing decisions.
    return Math.ceil(text.length / 4);
  }

  costUsd(tokens: { in: number; out: number }): number {
    return computeCost(this.pricing, tokens);
  }
}
