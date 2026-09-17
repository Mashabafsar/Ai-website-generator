import { AsyncLocalStorage } from "node:async_hooks";

// Per-operation token accounting. AI providers push a UsageEvent for every model
// call into the active capture context; the operation boundary (generate / edit)
// collects them and persists rows to the admin ledger. Capture is a no-op when
// no context is active, so provider code never has to care whether it's being
// metered.

export type UsageEvent = {
  provider: string; // cursor | mock
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  /** True = measured from the provider response; false = estimated locally. */
  estimated: boolean;
};

type Store = { events: UsageEvent[] };

const storage = new AsyncLocalStorage<Store>();

/** ~4 characters per token — a rough fallback when a provider omits usage. */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/** Records a usage event into the active capture context (no-op otherwise). */
export function recordUsage(event: UsageEvent): void {
  storage.getStore()?.events.push(event);
}

/** Runs `fn` inside a fresh capture context and returns its result + events. */
export async function withUsageCapture<T>(
  fn: () => Promise<T>
): Promise<{ result: T; events: UsageEvent[] }> {
  const store: Store = { events: [] };
  const result = await storage.run(store, fn);
  return { result, events: store.events };
}
