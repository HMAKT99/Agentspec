import OpenAI from "openai";

import type { CallOpts, ModelAdapter, ModelResponse } from "../types.js";
import { type Pricing, computeCost, lookupPricing } from "./pricing.js";

export interface OpenAIAdapterOptions {
  modelId: string;
  apiKey?: string;
  client?: OpenAI;
  pricing?: Pricing;
  maxOutputTokens?: number;
}

export class OpenAIAdapter implements ModelAdapter {
  readonly id: string;
  readonly modelVersion: string;
  private readonly client: OpenAI;
  private readonly modelId: string;
  private readonly pricing: Pricing;
  private readonly maxOutputTokens: number;

  constructor(opts: OpenAIAdapterOptions) {
    this.modelId = opts.modelId;
    this.id = `openai/${opts.modelId}`;
    this.modelVersion = opts.modelId;
    this.pricing = opts.pricing ?? lookupPricing(opts.modelId);
    this.maxOutputTokens = opts.maxOutputTokens ?? 1024;
    this.client =
      opts.client ??
      new OpenAI({
        ...(opts.apiKey !== undefined ? { apiKey: opts.apiKey } : {}),
      });
  }

  async call(system: string, user: string, opts: CallOpts = {}): Promise<ModelResponse> {
    const response = await this.client.chat.completions.create(
      {
        model: this.modelId,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: opts.maxOutputTokens ?? this.maxOutputTokens,
        ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
        ...(opts.seed !== undefined ? { seed: opts.seed } : {}),
      },
      opts.signal ? { signal: opts.signal } : undefined,
    );

    const choice = response.choices[0];
    const text = (choice?.message?.content ?? "").trim();

    return {
      text,
      inputTokens: response.usage?.prompt_tokens ?? this.tokenize(system) + this.tokenize(user),
      outputTokens: response.usage?.completion_tokens ?? this.tokenize(text),
      modelVersion: response.model ?? this.modelId,
      ...(choice?.finish_reason ? { stopReason: choice.finish_reason } : {}),
    };
  }

  tokenize(text: string): number {
    return Math.ceil(text.length / 4);
  }

  costUsd(tokens: { in: number; out: number }): number {
    return computeCost(this.pricing, tokens);
  }
}
