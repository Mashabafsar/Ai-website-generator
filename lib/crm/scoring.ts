// Lead scoring and marketing consent.
//
// The score lives in Postgres and is pushed to HubSpot by the outbox worker.
// Keeping it local is what makes scoring idempotent: `CrmScoreEvent` has a
// unique key per (action, subject), so replayed webhooks and double-submitted
// forms can't inflate anyone's score.

import { prisma } from "@/lib/prisma";
import {
  CrmJobKind,
  CrmScoreAction,
  oneTimeScore,
  packageScore,
} from "@/lib/crm/config";
import { enqueueCrmJob } from "@/lib/crm/outbox";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

/** Create the CRM profile row for an account if it doesn't exist yet. */
export async function ensureCrmProfile(userId: string) {
  return prisma.crmProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

/**
 * Record a scoring event and add its points to the account's total.
 *
 * Returns true when this call is what actually awarded the points. A duplicate
 * `idempotencyKey` returns false and changes nothing.
 */
async function award(params: {
  userId: string;
  action: CrmScoreAction;
  points: number;
  idempotencyKey: string;
}): Promise<boolean> {
  const { userId, action, points, idempotencyKey } = params;
  if (points <= 0) return false;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.crmScoreEvent.create({
        data: { userId, action, points, idempotencyKey },
      });
      await tx.crmProfile.upsert({
        where: { userId },
        create: { userId, leadScore: points, lastAction: action },
        update: { leadScore: { increment: points }, lastAction: action },
      });
    });
    return true;
  } catch (error) {
    // The unique key did its job: someone already awarded this exact event.
    if (isUniqueViolation(error)) return false;
    throw error;
  }
}

/**
 * Award an action that counts once per account, ever.
 *
 * Registration, theme selection, and questionnaire completion use this. Note
 * that filling the questionnaire by hand and importing it with the scraper pass
 * the same action, so together they are worth one award, not two.
 */
export async function awardOneTimeAction(
  userId: string,
  action: CrmScoreAction
): Promise<boolean> {
  const awarded = await award({
    userId,
    action,
    points: oneTimeScore(action),
    idempotencyKey: `${action}:${userId}`,
  });
  await enqueueCrmJob({ kind: CrmJobKind.CONTACT_SYNC, userId });
  return awarded;
}

/**
 * Award points for a credit-pack purchase. Unlike the one-time actions this
 * scores on every purchase, deduplicated by Stripe Checkout Session id so the
 * webhook and the success-page reconcile can both run it.
 */
export async function awardCreditPackPurchase(params: {
  userId: string;
  packId: string;
  stripeSessionId: string;
}): Promise<boolean> {
  const awarded = await award({
    userId: params.userId,
    action: CrmScoreAction.CREDIT_PACK_PURCHASED,
    points: packageScore(params.packId),
    idempotencyKey: `${CrmScoreAction.CREDIT_PACK_PURCHASED}:${params.stripeSessionId}`,
  });
  await enqueueCrmJob({ kind: CrmJobKind.CONTACT_SYNC, userId: params.userId });
  return awarded;
}

/**
 * Save the marketing-consent choice from the auth form.
 *
 * On registration the answer is recorded as given, true or false. On login an
 * unticked box means "didn't opt in just now", not "withdraw consent", so an
 * existing opt-in is preserved; only ticking the box changes anything. Consent
 * is withdrawn deliberately elsewhere, never as a side effect of signing in.
 */
export async function recordMarketingConsent(params: {
  userId: string;
  granted: boolean;
  mode: "register" | "login";
}): Promise<void> {
  const { userId, granted, mode } = params;

  if (mode === "login" && !granted) {
    await ensureCrmProfile(userId);
  } else {
    const existing = await prisma.crmProfile.findUnique({ where: { userId } });
    // Re-ticking the box on a later login shouldn't rewrite the original
    // opt-in timestamp; that date is the record of when consent was given.
    const unchanged = existing?.marketingConsent === granted;
    const consentAt = unchanged ? existing?.marketingConsentAt ?? new Date() : new Date();

    await prisma.crmProfile.upsert({
      where: { userId },
      create: {
        userId,
        marketingConsent: granted,
        marketingConsentAt: consentAt,
      },
      update: {
        marketingConsent: granted,
        marketingConsentAt: consentAt,
      },
    });
  }

  await enqueueCrmJob({ kind: CrmJobKind.CONTACT_SYNC, userId });
}
