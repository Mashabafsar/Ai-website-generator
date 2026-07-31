// Lightweight in-memory rate limiter. Sufficient for a single-instance MVP; swap
// for a shared store (Redis/Upstash) before running multiple instances.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = { ok: boolean; remaining: number; retryAfterMs: number };

/**
 * Fixed-window limiter. `key` should identify the caller + action, e.g.
 * `ai_generate:<userId>`. Returns ok=false when the window limit is exceeded.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0, retryAfterMs: existing.resetAt - now };
  }

  existing.count += 1;
  return { ok: true, remaining: limit - existing.count, retryAfterMs: 0 };
}

// Opportunistically evict stale buckets so the map doesn't grow unbounded.
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now >= bucket.resetAt) buckets.delete(key);
    }
  }, 60_000);
  // Don't keep the process alive just for cleanup.
  (timer as { unref?: () => void }).unref?.();
}
