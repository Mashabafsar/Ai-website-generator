import type Stripe from "stripe";
import { env } from "@/lib/env";
import { PackageType } from "@/lib/constants";
import { PACKAGE_LABELS } from "@/lib/quote/pricing";
import type { QuoteResult } from "@/lib/quote/quote";

/**
 * Build Stripe line items for a website package from the computed quote.
 * Managed hosting adds a recurring monthly subscription line, so the checkout
 * runs in `subscription` mode; self-hosting is a one-time `payment`.
 */
export function buildPackageCheckout(quote: QuoteResult): {
  mode: Stripe.Checkout.SessionCreateParams.Mode;
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
} {
  const packageLabel = PACKAGE_LABELS[quote.packageType] ?? quote.packageType;
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  const oneTimePriceId =
    quote.packageType === PackageType.MANAGED_HOSTING
      ? env.stripe.managedCreationPriceId
      : env.stripe.selfHostingPriceId;

  // One-time creation fee (full one-time total from the deterministic quote).
  lineItems.push(
    oneTimePriceId
      ? { price: oneTimePriceId, quantity: 1 }
      : {
          quantity: 1,
          price_data: {
            currency: quote.currency.toLowerCase(),
            unit_amount: quote.oneTimeTotal * 100,
            product_data: { name: `${packageLabel} — website build` },
          },
        }
  );

  const isManaged = quote.packageType === PackageType.MANAGED_HOSTING && quote.monthlyTotal > 0;

  if (isManaged) {
    lineItems.push(
      env.stripe.managedMonthlyPriceId
        ? { price: env.stripe.managedMonthlyPriceId, quantity: 1 }
        : {
            quantity: 1,
            price_data: {
              currency: quote.currency.toLowerCase(),
              unit_amount: quote.monthlyTotal * 100,
              recurring: { interval: "month" },
              product_data: { name: "Monthly hosting" },
            },
          }
    );
  }

  return { mode: isManaged ? "subscription" : "payment", lineItems };
}
