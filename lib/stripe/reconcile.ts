import { getStripe } from "@/lib/stripe/stripe";
import { grantPurchase } from "@/lib/credits/credits";
import { prisma } from "@/lib/prisma";
import { PaymentType, PaymentStatus, ProjectStatus, GithubSyncStatus } from "@/lib/constants";
import { syncPaidCustomerToHubSpot } from "@/lib/crm/hubspot";
import { trySyncProjectToGitHub } from "@/lib/github/github";

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

/** Statuses that already mean the website was bought — never downgrade them. */
const DELIVERED_STATUSES: string[] = [
  ProjectStatus.LIVE,
  ProjectStatus.EXPORTED,
  ProjectStatus.DEPLOYING,
];

/**
 * Reconciles a website-package checkout on the delivery-page redirect. Mirrors
 * the Stripe webhook: marks the pending Payment PAID and unlocks the project.
 * Idempotent and scoped to the paying user + this project, so it's safe to run
 * on every page load and can't collide with the webhook.
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
  if (session.metadata?.type !== PaymentType.WEBSITE_PACKAGE) return null;
  if (session.metadata?.projectId !== params.projectId) return null;

  const sessionUser = session.metadata?.userId ?? session.client_reference_id ?? undefined;
  if (!sessionUser || sessionUser !== params.userId) return null;

  // "payment" mode → payment_status "paid"; subscriptions may report
  // "no_payment_required" while the session itself is "complete".
  const paid =
    session.payment_status === "paid" ||
    session.payment_status === "no_payment_required" ||
    session.status === "complete";
  if (!paid) return null;

  await prisma.payment.updateMany({
    where: { stripeSessionId: session.id },
    data: {
      status: PaymentStatus.PAID,
      stripePaymentIntentId:
        typeof session.payment_intent === "string" ? session.payment_intent : undefined,
      stripeSubscriptionId:
        typeof session.subscription === "string" ? session.subscription : undefined,
    },
  });

  const project = await prisma.project.findUnique({ where: { id: params.projectId } });
  if (project && !DELIVERED_STATUSES.includes(project.status)) {
    await prisma.project.update({
      where: { id: params.projectId },
      data: { status: ProjectStatus.PAID },
    });
  }

  await syncPaidCustomerToHubSpot(params.projectId);
  if (project?.githubSyncStatus !== GithubSyncStatus.SYNCED) {
    await trySyncProjectToGitHub(params.projectId);
  }

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
