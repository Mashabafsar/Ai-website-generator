import { requireUser, jsonOk, jsonError } from "@/lib/http";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe/stripe";
import { ensureStripeCustomer } from "@/lib/stripe/customer";

export async function POST() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const stripe = getStripe();
  if (!stripe) {
    return jsonError(
      "Payments aren't set up yet. Please try again later.",
      503,
      "STRIPE_NOT_CONFIGURED"
    );
  }

  try {
    const customerId = await ensureStripeCustomer({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${env.appUrl}/app/settings?tab=billing`,
    });

    if (!session.url) {
      return jsonError("Could not open the billing portal.", 502, "PORTAL_URL_MISSING");
    }

    return jsonOk({ url: session.url });
  } catch (err) {
    console.error("[billing] portal session failed:", err instanceof Error ? err.message : err);
    return jsonError(
      "Could not open the billing portal. Please try again.",
      502,
      "PORTAL_FAILED"
    );
  }
}
