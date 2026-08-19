import { getStripe } from "@/lib/stripe/stripe";
import { grantPurchase } from "@/lib/credits/credits";
import { PaymentType } from "@/lib/constants";

/**
 * Reconciles a credit-pack checkout directly with Stripe on the success redirect.
 *
 * Webhooks are the primary path, but they can't reach a local dev server (and can
 * be delayed in production), which leaves buyers without their credits. Verifying
 * the session on return guarantees credits are granted the moment the user lands
 * back on the app. `grantPurchase` is idempotent per Stripe session id, so this
 * and the webhook can both run without ever double-crediting.
 *
 * Returns the number of credits granted (0 if it was already granted), or null
 * when the session is not a paid credit purchase for this user.
 */
export async function reconcileCreditCheckout(params: {
  userId: string;
  sessionId: string;
}): Promise<{ credited: number } | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(params.sessionId);
  } catch {
    return null;
  }
  if (!session || session.payment_status !== "paid") return null;
  if (session.metadata?.type !== PaymentType.CREDIT_PACK) return null;

  // Only ever credit the account that actually made the purchase.
  const sessionUser = session.metadata?.userId ?? session.client_reference_id ?? undefined;
  if (!sessionUser || sessionUser !== params.userId) return null;

  const credits = Number(session.metadata?.credits ?? 0);
  if (!(credits > 0)) return null;

  await grantPurchase({ userId: params.userId, credits, stripePaymentId: session.id });
  return { credited: credits };
}
