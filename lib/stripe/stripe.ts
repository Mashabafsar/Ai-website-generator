import Stripe from "stripe";
import { env } from "@/lib/env";
import { CREDIT_PACKS, type CreditPackId } from "@/lib/constants";

let cached: Stripe | null = null;

/** Lazily create the Stripe client. Returns null when Stripe isn't configured. */
export function getStripe(): Stripe | null {
  if (!env.stripe.enabled) return null;
  if (!cached) {
    cached = new Stripe(env.stripe.secretKey);
  }
  return cached;
}

/** Resolve the configured Stripe price id for a credit pack. */
export function creditPackPriceId(packId: CreditPackId): string {
  switch (packId) {
    case "small":
      return env.stripe.creditPackSmall;
    case "medium":
      return env.stripe.creditPackMedium;
    case "large":
      return env.stripe.creditPackLarge;
    default:
      return "";
  }
}

export function getCreditPack(packId: string) {
  return CREDIT_PACKS.find((p) => p.id === packId) ?? null;
}

/**
 * Resolve a Checkout Session's pack from its `packId` metadata.
 *
 * Credits and lead-score points come from `CREDIT_PACKS`, never from the
 * session's `credits` metadata: metadata is attacker-influencable if a session
 * is ever created outside our checkout route, and a stale value would survive a
 * pack redefinition. Falling back to the credit count keeps sessions created
 * before `packId` was recorded grantable.
 */
export function resolveCreditPack(metadata: Record<string, string> | null | undefined) {
  const byId = getCreditPack(metadata?.packId ?? "");
  if (byId) return byId;

  const credits = Number(metadata?.credits ?? 0);
  if (!Number.isInteger(credits) || credits <= 0) return null;
  return CREDIT_PACKS.find((p) => p.credits === credits) ?? null;
}
