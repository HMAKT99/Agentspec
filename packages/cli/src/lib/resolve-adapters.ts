import type { MdpactConfig } from "@mdpact/config";
import { AnthropicAdapter, GoogleAdapter, type ModelAdapter, OpenAIAdapter } from "@mdpact/engine";

export interface ResolveOptions {
  /** Override subset of model ids the user wants to use (from --models flag). */
  filter?: string[];
}

export function resolveAdapters(config: MdpactConfig, opts: ResolveOptions = {}): ModelAdapter[] {
  const normalized = config.models.map(normalize);
  const filtered =
    opts.filter && opts.filter.length > 0
      ? normalized.filter((m) => opts.filter!.some((want) => m.id === want || m.modelId === want))
      : normalized;

  return filtered.map((m) => {
    switch (m.provider) {
      case "anthropic":
        return new AnthropicAdapter({
          modelId: m.modelId,
          ...(m.pricing ? { pricing: { ...m.pricing, source: "user-config" } } : {}),
          ...(m.maxOutputTokens ? { maxOutputTokens: m.maxOutputTokens } : {}),
        });
      case "openai":
        return new OpenAIAdapter({
          modelId: m.modelId,
          ...(m.pricing ? { pricing: { ...m.pricing, source: "user-config" } } : {}),
          ...(m.maxOutputTokens ? { maxOutputTokens: m.maxOutputTokens } : {}),
        });
      case "google":
        return new GoogleAdapter({
          modelId: m.modelId,
          ...(m.pricing ? { pricing: { ...m.pricing, source: "user-config" } } : {}),
          ...(m.maxOutputTokens ? { maxOutputTokens: m.maxOutputTokens } : {}),
        });
    }
  });
}

interface NormalizedModel {
  id: string;
  provider: "anthropic" | "openai" | "google";
  modelId: string;
  pricing?: { inputPerMillion: number; outputPerMillion: number };
  maxOutputTokens?: number;
}

function normalize(entry: MdpactConfig["models"][number]): NormalizedModel {
  if (typeof entry === "string") {
    const parts = entry.split(":");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new Error(
        `Invalid model shorthand "${entry}" — expected "<provider>:<modelId>" (e.g. "anthropic:claude-sonnet-4-6").`,
      );
    }
    const provider = parts[0] as NormalizedModel["provider"];
    if (provider !== "anthropic" && provider !== "openai" && provider !== "google") {
      throw new Error(
        `Unknown provider "${provider}" in model "${entry}". Use anthropic, openai, or google.`,
      );
    }
    return { id: entry, provider, modelId: parts[1] };
  }

  return {
    id: entry.id ?? `${entry.provider}/${entry.modelId}`,
    provider: entry.provider,
    modelId: entry.modelId,
    ...(entry.pricing ? { pricing: entry.pricing } : {}),
    ...(entry.maxOutputTokens ? { maxOutputTokens: entry.maxOutputTokens } : {}),
  };
}
