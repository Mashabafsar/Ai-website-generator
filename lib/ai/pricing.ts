/**
 * Estimated provider cost for AI calls on the admin ledger.
 *
 * Rates are USD per 1M tokens. Override with env vars when your Cursor / model
 * bill differs from these defaults. Matching is by substring on the model id
 * (case-insensitive), first hit wins.
 */

export type ModelRate = {
  /** USD per 1M prompt tokens */
  inputPerMillion: number;
  /** USD per 1M completion tokens */
  outputPerMillion: number;
};

const DEFAULT_HEAVY: ModelRate = { inputPerMillion: 15, outputPerMillion: 75 };
const DEFAULT_LIGHT: ModelRate = { inputPerMillion: 3, outputPerMillion: 15 };
const DEFAULT_FALLBACK: ModelRate = { inputPerMillion: 5, outputPerMillion: 25 };

function envRate(inputKey: string, outputKey: string, fallback: ModelRate): ModelRate {
  const input = Number(process.env[inputKey]);
  const output = Number(process.env[outputKey]);
  return {
    inputPerMillion: Number.isFinite(input) && input > 0 ? input : fallback.inputPerMillion,
    outputPerMillion: Number.isFinite(output) && output > 0 ? output : fallback.outputPerMillion,
  };
}

const HEAVY = () => envRate("AI_COST_HEAVY_INPUT_PER_M", "AI_COST_HEAVY_OUTPUT_PER_M", DEFAULT_HEAVY);
const LIGHT = () => envRate("AI_COST_LIGHT_INPUT_PER_M", "AI_COST_LIGHT_OUTPUT_PER_M", DEFAULT_LIGHT);

/** Ordered matchers — more specific first. */
function rateForModel(model: string): ModelRate {
  const m = model.toLowerCase();
  if (!m || m.includes("deterministic") || m.includes("mock") || m.includes("template")) {
    return { inputPerMillion: 0, outputPerMillion: 0 };
  }
  if (m.includes("opus") || m.includes("o1") || m.includes("o3")) return HEAVY();
  if (
    m.includes("composer") ||
    m.includes("sonnet") ||
    m.includes("haiku") ||
    m.includes("flash") ||
    m.includes("mini") ||
    m.includes("light")
  ) {
    return LIGHT();
  }
  // Vision often rides the heavy model name.
  if (m.includes("gpt-4") || m.includes("claude-4") || m.includes("claude-3-5") || m.includes("claude-3.5")) {
    return HEAVY();
  }
  return envRate("AI_COST_DEFAULT_INPUT_PER_M", "AI_COST_DEFAULT_OUTPUT_PER_M", DEFAULT_FALLBACK);
}

/** Whole cents (USD × 100), rounded. */
export function estimateCostUsdCents(params: {
  model: string;
  promptTokens: number;
  completionTokens: number;
}): number {
  const rate = rateForModel(params.model);
  const usd =
    (Math.max(0, params.promptTokens) / 1_000_000) * rate.inputPerMillion +
    (Math.max(0, params.completionTokens) / 1_000_000) * rate.outputPerMillion;
  return Math.round(usd * 100);
}

export function formatUsdCents(cents: number): string {
  const value = (cents ?? 0) / 100;
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}
