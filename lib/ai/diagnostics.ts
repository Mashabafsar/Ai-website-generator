import { AsyncLocalStorage } from "node:async_hooks";
import type { AiFailure } from "@/lib/ai/failure";

// Per-operation failure accounting, mirroring lib/ai/usage for tokens. The
// fallback chain pushes a classified failure for every provider it gives up on;
// the operation boundary (generate / edit) reads them back so the outcome can be
// billed, shown to the customer, and logged for an operator. Capture is a no-op
// when no context is active, so provider code never has to care.

export type AiFailureLog = { failures: AiFailure[] };

const storage = new AsyncLocalStorage<AiFailureLog>();

export function newFailureLog(): AiFailureLog {
  return { failures: [] };
}

export function recordAiFailure(failure: AiFailure): void {
  storage.getStore()?.failures.push(failure);
}

/**
 * Runs `fn` with failures collecting into `log`. The log is the caller's, not a
 * return value, so the failures survive `fn` throwing — a provider chain that
 * dies on its last step is exactly when an operator needs to see why.
 */
export function withAiDiagnostics<T>(log: AiFailureLog, fn: () => Promise<T>): Promise<T> {
  return storage.run(log, fn);
}
