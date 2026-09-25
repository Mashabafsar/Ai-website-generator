// Single definition of "this checkout is paid, deliver it".
//
// Both the Stripe webhook and the success-page reconcile call these, so the two
// paths can never disagree about what counts as paid or about which side
// effects a purchase triggers.

import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { grantPurchase } from "@/lib/credits/credits";
import { PaymentStatus, PaymentType, ProjectStatus } from "@/lib/constants";
import { resolveCreditPack } from "@/lib/stripe/stripe";
import { CrmJobKind } from "@/lib/crm/config";
import { enqueueCrmJob } from "@/lib/crm/outbox";
import { awardCreditPackPurchase } from "@/lib/crm/scoring";

/** Statuses that already mean the website was bought — never downgrade them. */
const DELIVERED_STATUSES: string[] = [
  ProjectStatus.LIVE,
  ProjectStatus.EXPORTED,
  ProjectStatus.DEPLOYING,
];

/**
 * Whether Stripe has the money.
 *
 * Deliberately does not accept `status === "complete"`. Delayed notification
 * methods finish the session immediately and settle days later, so treating
 * "complete" as paid would hand over the site before the funds arrive.
 */
export function isSessionPaid(session: Stripe.Checkout.Session): boolean {
  return (
    session.payment_status === "paid" || session.payment_status === "no_payment_required"
  );
}

export function sessionUserId(session: Stripe.Checkout.Session): string | undefined {
  return session.metadata?.userId ?? session.client_reference_id ?? undefined;
}

/**
 * Grant a paid credit pack and score the purchase.
 *
 * Credits come from the pack definition rather than the session's `credits`
 * metadata, so the amount granted is always one we set the price for.
 * Idempotent: `grantPurchase` and the score event are both keyed on the
 * session id.
 */
export async function fulfillCreditPackCheckout(
  session: Stripe.Checkout.Session
): Promise<{ credited: number } | null> {
  if (session.metadata?.type !== PaymentType.CREDIT_PACK) return null;
  if (!isSessionPaid(session)) return null;

  const userId = sessionUserId(session);
  if (!userId) return null;

  const pack = resolveCreditPack(session.metadata);
  if (!pack) {
    console.error(`[stripe] credit session ${session.id} has no recognizable pack`);
    return null;
  }

  await grantPurchase({ userId, credits: pack.credits, stripePaymentId: session.id });

  try {
    await awardCreditPackPurchase({ userId, packId: pack.id, stripeSessionId: session.id });
  } catch (err) {
    console.error("[crm] credit pack score failed:", err instanceof Error ? err.message : err);
  }

  return { credited: pack.credits };
}

/**
 * Mark a website package paid, unlock delivery, and queue the HubSpot deal.
 *
 * Returns null when the session isn't a paid website purchase, which is what
 * keeps an unsettled delayed payment from unlocking anything.
 */
export async function fulfillWebsiteCheckout(
  session: Stripe.Checkout.Session
): Promise<{ projectId: string; paymentId: string | null } | null> {
  if (session.metadata?.type !== PaymentType.WEBSITE_PACKAGE) return null;

  const projectId = session.metadata?.projectId;
  if (!projectId) return null;
  if (!isSessionPaid(session)) return null;

  await prisma.payment.updateMany({
    where: { stripeSessionId: session.id },
    data: {
      status: PaymentStatus.PAID,
      // What Stripe actually charged. The quote's dollar total can differ when
      // a configured Stripe price is used instead of the computed inline price.
      amountCents: session.amount_total ?? undefined,
      stripePaymentIntentId:
        typeof session.payment_intent === "string" ? session.payment_intent : undefined,
      stripeSubscriptionId:
        typeof session.subscription === "string" ? session.subscription : undefined,
    },
  });

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (project && !DELIVERED_STATUSES.includes(project.status)) {
    await prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.PAID },
    });
  }

  const payment = await prisma.payment.findUnique({
    where: { stripeSessionId: session.id },
    select: { id: true },
  });

  if (payment) {
    // Deduped on the payment id, so replays of this session queue one deal.
    await enqueueCrmJob({
      kind: CrmJobKind.PURCHASE_DEAL,
      userId: project?.userId ?? null,
      projectId,
      paymentId: payment.id,
    });
  }

  return { projectId, paymentId: payment?.id ?? null };
}
