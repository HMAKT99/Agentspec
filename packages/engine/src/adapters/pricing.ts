export interface Pricing {
  inputPerMillion: number;
  outputPerMillion: number;
  source: string;
}

/**
 * Static default pricing. Accurate at time of authoring; always allow
 * user overrides via config. The `source` field is informational.
 */
export const DEFAULT_PRICING: Record<string, Pricing> = {
  // Anthropic — 2026-Q1 published rates
  "claude-opus-4-7": { inputPerMillion: 15, outputPerMillion: 75, source: "anthropic/2026" },
  "claude-sonnet-4-6": { inputPerMillion: 3, outputPerMillion: 15, source: "anthropic/2026" },
  "claude-haiku-4-5": { inputPerMillion: 1, outputPerMillion: 5, source: "anthropic/2026" },
  "claude-haiku-4-5-20251001": {
    inputPerMillion: 1,
    outputPerMillion: 5,
    source: "anthropic/2026",
  },
};

export function lookupPricing(modelId: string): Pricing {
  const exact = DEFAULT_PRICING[modelId];
  if (exact) return exact;

  // Fuzzy match by prefix so versioned IDs (e.g. "claude-sonnet-4-6-20250301")
  // fall back to the family default.
  for (const [key, pricing] of Object.entries(DEFAULT_PRICING)) {
    if (modelId.startsWith(key)) return pricing;
  }

  return { inputPerMillion: 0, outputPerMillion: 0, source: "unknown — override via config" };
}

export function computeCost(pricing: Pricing, tokens: { in: number; out: number }): number {
  return (
    (tokens.in / 1_000_000) * pricing.inputPerMillion +
    (tokens.out / 1_000_000) * pricing.outputPerMillion
  );
}
