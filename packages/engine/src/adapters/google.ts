import { GoogleGenAI } from "@google/genai";

import type { CallOpts, ModelAdapter, ModelResponse } from "../types.js";
import { type Pricing, computeCost, lookupPricing } from "./pricing.js";

export interface GoogleAdapterOptions {
  modelId: string;
  apiKey?: string;
  client?: GoogleGenAI;
  pricing?: Pricing;
  maxOutputTokens?: number;
}

export class GoogleAdapter implements ModelAdapter {
  readonly id: string;
  readonly modelVersion: string;
  private readonly client: GoogleGenAI;
  private readonly modelId: string;
  private readonly pricing: Pricing;
  private readonly maxOutputTokens: number;

  constructor(opts: GoogleAdapterOptions) {
    this.modelId = opts.modelId;
    this.id = `google/${opts.modelId}`;
    this.modelVersion = opts.modelId;
    this.pricing = opts.pricing ?? lookupPricing(opts.modelId);
    this.maxOutputTokens = opts.maxOutputTokens ?? 1024;
    this.client =
      opts.client ??
      new GoogleGenAI({
        ...(opts.apiKey !== undefined ? { apiKey: opts.apiKey } : {}),
      });
  }

  async call(system: string, user: string, opts: CallOpts = {}): Promise<ModelResponse> {
    const response = await this.client.models.generateContent({
      model: this.modelId,
      contents: [{ role: "user", parts: [{ text: user }] }],
      config: {
        systemInstruction: system,
        maxOutputTokens: opts.maxOutputTokens ?? this.maxOutputTokens,
        ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
        ...(opts.seed !== undefined ? { seed: opts.seed } : {}),
        ...(opts.signal ? { abortSignal: opts.signal } : {}),
      },
    });

    const text = (response.text ?? "").trim();
    const usage = response.usageMetadata ?? {};
    const inputTokens = usage.promptTokenCount ?? this.tokenize(system) + this.tokenize(user);
    const outputTokens = usage.candidatesTokenCount ?? this.tokenize(text);

    return {
      text,
      inputTokens,
      outputTokens,
      modelVersion: this.modelId,
    };
  }

  tokenize(text: string): number {
    return Math.ceil(text.length / 4);
  }

  costUsd(tokens: { in: number; out: number }): number {
    return computeCost(this.pricing, tokens);
  }
}
