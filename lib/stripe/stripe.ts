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
    case "starter":
      return env.stripe.creditPack100;
    case "growth":
      return env.stripe.creditPack300;
    case "pro":
      return env.stripe.creditPack1000;
    default:
      return "";
  }
}

export function getCreditPack(packId: string) {
  return CREDIT_PACKS.find((p) => p.id === packId) ?? null;
}
