import { requireUser, jsonOk, jsonError, readJson } from "@/lib/http";
import { env } from "@/lib/env";
import { getStripe, getCreditPack, creditPackPriceId } from "@/lib/stripe/stripe";
import { PaymentType } from "@/lib/constants";
import type { CreditPackId } from "@/lib/constants";

export async function POST(req: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await readJson<{ packId: CreditPackId }>(req);
  if (!body?.packId) return jsonError("Missing packId", 400);

  const pack = getCreditPack(body.packId);
  if (!pack) return jsonError("Unknown credit pack", 400);

  const stripe = getStripe();
  if (!stripe) {
    return jsonError(
      "Payments are not configured on this environment.",
      503,
      "STRIPE_NOT_CONFIGURED"
    );
  }

  const priceId = creditPackPriceId(body.packId);
  const successUrl = `${env.appUrl}/app/credits?purchase=success`;
  const cancelUrl = `${env.appUrl}/app/credits?purchase=cancelled`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // Use the configured price id when present; otherwise build an inline price
    // so demos with only a secret key still work.
    line_items: [
      priceId
        ? { price: priceId, quantity: 1 }
        : {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: pack.priceUsd * 100,
              product_data: { name: `${pack.label} credit pack — ${pack.credits} credits` },
            },
          },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: user.id,
    metadata: {
      type: PaymentType.CREDIT_PACK,
      userId: user.id,
      packId: pack.id,
      credits: String(pack.credits),
    },
  });

  return jsonOk({ url: session.url });
}
