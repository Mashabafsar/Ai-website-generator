import { getStripe } from "@/lib/stripe/stripe";
import { prisma } from "@/lib/prisma";
import { PaymentType, PaymentStatus, GithubSyncStatus } from "@/lib/constants";
import {
  fulfillCreditPackCheckout,
  fulfillWebsiteCheckout,
  sessionUserId,
} from "@/lib/stripe/fulfillment";
import { scheduleCrmDrain } from "@/lib/crm/sync";
import { trySyncProjectToGitHub } from "@/lib/github/github";

/**
 * Reconciles a credit-pack checkout directly with Stripe on the success redirect.
 *
 * Webhooks are the primary path, but they can't reach a local dev server (and can
 * be delayed in production), which leaves buyers without their credits. Verifying
 * the session on return guarantees credits are granted the moment the user lands
 * back on the app. Fulfillment is idempotent per Stripe session id, so this
 * and the webhook can both run without ever double-crediting.
 *
 * Returns the pack size once the purchase is confirmed, or null when the
 * session is not a paid credit purchase for this user.
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
  if (!session) return null;

  // Only ever credit the account that actually made the purchase.
  if (sessionUserId(session) !== params.userId) return null;

  const result = await fulfillCreditPackCheckout(session);
  if (result) scheduleCrmDrain();
  return result;
}

/**
 * Reconciles a website-package checkout on the delivery-page redirect. Mirrors
 * the Stripe webhook: marks the pending Payment PAID, unlocks the project, and
 * queues the HubSpot deal. Idempotent and scoped to the paying user + this
 * project, so it's safe to run on every page load and can't collide with the
 * webhook.
 *
 * Returns { paid: true } once the payment is confirmed, else null.
 */
export async function reconcileWebsiteCheckout(params: {
  userId: string;
  projectId: string;
  sessionId: string;
}): Promise<{ paid: true } | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(params.sessionId);
  } catch {
    return null;
  }
  if (!session) return null;
  if (session.metadata?.projectId !== params.projectId) return null;
  if (sessionUserId(session) !== params.userId) return null;

  const result = await fulfillWebsiteCheckout(session);
  if (!result) return null;

  const project = await prisma.project.findUnique({ where: { id: params.projectId } });
  if (project?.githubSyncStatus !== GithubSyncStatus.SYNCED) {
    await trySyncProjectToGitHub(params.projectId);
  }
  scheduleCrmDrain();

  return { paid: true };
}

/**
 * Reconciles the most recent PENDING website payment for a project by looking up
 * its Stripe session. This covers buyers who already paid but never had the
 * webhook delivered and have since lost the `session_id` from the URL. No-op
 * when there is no pending payment to confirm.
 */
export async function reconcilePendingWebsiteCheckout(params: {
  userId: string;
  projectId: string;
}): Promise<{ paid: true } | null> {
  const pending = await prisma.payment.findFirst({
    where: {
      projectId: params.projectId,
      type: PaymentType.WEBSITE_PACKAGE,
      status: PaymentStatus.PENDING,
      stripeSessionId: { not: null },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!pending?.stripeSessionId) return null;

  return reconcileWebsiteCheckout({
    userId: params.userId,
    projectId: params.projectId,
    sessionId: pending.stripeSessionId,
  });
}
