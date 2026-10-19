import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { encryptBillingPayload, decryptBillingPayload } from "@/lib/crypto/billing";
import { PaymentStatus, PaymentType, CreditLedgerReason } from "@/lib/constants";
import { getStripe } from "@/lib/stripe/stripe";

export const BillingRecordKind = {
  WEBSITE_PACKAGE: "website_package",
  CREDIT_PACK: "credit_pack",
  INVOICE: "invoice",
  PAYMENT_METHOD: "payment_method",
} as const;
export type BillingRecordKind = (typeof BillingRecordKind)[keyof typeof BillingRecordKind];

/** Plaintext shape stored inside the AES-GCM blob. Never includes card PANs. */
export type BillingPayload = {
  kind: BillingRecordKind | string;
  label: string;
  amountCents: number;
  currency: string;
  status: string;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  stripeSubscriptionId?: string | null;
  stripeInvoiceId?: string | null;
  projectId?: string | null;
  packageType?: string | null;
  packId?: string | null;
  credits?: number | null;
  /** Optional card brand from Stripe PaymentMethod (e.g. visa). */
  cardBrand?: string | null;
  /** Optional last 4 digits from Stripe PaymentMethod — never a full PAN. */
  cardLast4?: string | null;
  paidAt?: string | null;
};

export type BillingHistoryItem = BillingPayload & {
  id: string;
  source: "billing_record" | "payment" | "credit_ledger" | "stripe_invoice";
  createdAt: string;
};

type UpsertInput = {
  userId: string;
  kind: BillingRecordKind;
  stripeSessionId?: string | null;
  stripeInvoiceId?: string | null;
  stripePaymentIntentId?: string | null;
  stripeSubscriptionId?: string | null;
  payload: BillingPayload;
};

/**
 * Persist an encrypted billing snapshot. No-op when BILLING_ENCRYPTION_KEY is unset
 * so local demos without the key still fulfill checkouts.
 */
export async function upsertEncryptedBillingRecord(input: UpsertInput): Promise<void> {
  if (!env.billing.enabled) {
    console.warn("[billing] BILLING_ENCRYPTION_KEY unset; skipping BillingRecord write");
    return;
  }

  try {
    const blob = encryptBillingPayload(input.payload);
    const data = {
      userId: input.userId,
      kind: input.kind,
      stripeSessionId: input.stripeSessionId ?? null,
      stripeInvoiceId: input.stripeInvoiceId ?? null,
      stripePaymentIntentId: input.stripePaymentIntentId ?? null,
      stripeSubscriptionId: input.stripeSubscriptionId ?? null,
      ciphertext: blob.ciphertext,
      iv: blob.iv,
      authTag: blob.authTag,
    };

    if (input.stripeSessionId) {
      await prisma.billingRecord.upsert({
        where: { stripeSessionId: input.stripeSessionId },
        create: data,
        update: {
          kind: data.kind,
          stripeInvoiceId: data.stripeInvoiceId,
          stripePaymentIntentId: data.stripePaymentIntentId,
          stripeSubscriptionId: data.stripeSubscriptionId,
          ciphertext: data.ciphertext,
          iv: data.iv,
          authTag: data.authTag,
        },
      });
      return;
    }

    if (input.stripeInvoiceId) {
      await prisma.billingRecord.upsert({
        where: { stripeInvoiceId: input.stripeInvoiceId },
        create: data,
        update: {
          kind: data.kind,
          stripeSessionId: data.stripeSessionId,
          stripePaymentIntentId: data.stripePaymentIntentId,
          stripeSubscriptionId: data.stripeSubscriptionId,
          ciphertext: data.ciphertext,
          iv: data.iv,
          authTag: data.authTag,
        },
      });
      return;
    }

    await prisma.billingRecord.create({ data });
  } catch (err) {
    console.error(
      "[billing] failed to write BillingRecord:",
      err instanceof Error ? err.message : err
    );
  }
}

/** Best-effort card brand/last4 from a Checkout Session (never a PAN). */
export async function cardSummaryFromSession(
  session: Stripe.Checkout.Session
): Promise<{ cardBrand: string | null; cardLast4: string | null }> {
  const empty = { cardBrand: null, cardLast4: null };
  const stripe = getStripe();
  if (!stripe) return empty;

  const piId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  if (!piId) return empty;

  try {
    const pi = await stripe.paymentIntents.retrieve(piId, {
      expand: ["payment_method"],
    });
    const pm = pi.payment_method;
    if (!pm || typeof pm === "string") return empty;
    const card = pm.card;
    if (!card) return empty;
    return {
      cardBrand: card.brand ?? null,
      cardLast4: card.last4 ?? null,
    };
  } catch (err) {
    console.error(
      "[billing] could not load payment method summary:",
      err instanceof Error ? err.message : err
    );
    return empty;
  }
}

export async function recordWebsitePackageBilling(
  session: Stripe.Checkout.Session,
  userId: string
): Promise<void> {
  const card = await cardSummaryFromSession(session);
  await upsertEncryptedBillingRecord({
    userId,
    kind: BillingRecordKind.WEBSITE_PACKAGE,
    stripeSessionId: session.id,
    stripePaymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
    stripeSubscriptionId:
      typeof session.subscription === "string" ? session.subscription : null,
    payload: {
      kind: BillingRecordKind.WEBSITE_PACKAGE,
      label: "Website package",
      amountCents: session.amount_total ?? 0,
      currency: (session.currency ?? "usd").toUpperCase(),
      status: PaymentStatus.PAID,
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string" ? session.payment_intent : null,
      stripeSubscriptionId:
        typeof session.subscription === "string" ? session.subscription : null,
      projectId: session.metadata?.projectId ?? null,
      packageType: session.metadata?.packageType ?? null,
      ...card,
      paidAt: new Date().toISOString(),
    },
  });
}

export async function recordCreditPackBilling(
  session: Stripe.Checkout.Session,
  userId: string,
  credits: number,
  packId: string
): Promise<void> {
  const card = await cardSummaryFromSession(session);
  await upsertEncryptedBillingRecord({
    userId,
    kind: BillingRecordKind.CREDIT_PACK,
    stripeSessionId: session.id,
    stripePaymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
    payload: {
      kind: BillingRecordKind.CREDIT_PACK,
      label: `Credit pack (${credits} credits)`,
      amountCents: session.amount_total ?? 0,
      currency: (session.currency ?? "usd").toUpperCase(),
      status: PaymentStatus.PAID,
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string" ? session.payment_intent : null,
      packId,
      credits,
      ...card,
      paidAt: new Date().toISOString(),
    },
  });
}

function decryptRecordRow(row: {
  id: string;
  ciphertext: string;
  iv: string;
  authTag: string;
  createdAt: Date;
}): BillingHistoryItem | null {
  try {
    const payload = decryptBillingPayload<BillingPayload>({
      ciphertext: row.ciphertext,
      iv: row.iv,
      authTag: row.authTag,
    });
    return {
      ...payload,
      id: row.id,
      source: "billing_record",
      createdAt: row.createdAt.toISOString(),
    };
  } catch (err) {
    console.error(
      "[billing] decrypt failed for",
      row.id,
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

/**
 * Unified billing history: encrypted records first, then Payment / CreditLedger
 * fallbacks for older purchases, plus Stripe invoices when a customer exists.
 */
export async function listBillingHistory(userId: string): Promise<BillingHistoryItem[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  const items: BillingHistoryItem[] = [];
  const seenSessionIds = new Set<string>();
  const seenInvoiceIds = new Set<string>();

  if (env.billing.enabled) {
    const rows = await prisma.billingRecord.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    for (const row of rows) {
      const item = decryptRecordRow(row);
      if (!item) continue;
      items.push(item);
      if (item.stripeSessionId) seenSessionIds.add(item.stripeSessionId);
      if (item.stripeInvoiceId) seenInvoiceIds.add(item.stripeInvoiceId);
    }
  }

  const project = await prisma.project.findUnique({
    where: { userId },
    select: {
      id: true,
      payments: {
        where: { status: PaymentStatus.PAID, type: PaymentType.WEBSITE_PACKAGE },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  for (const payment of project?.payments ?? []) {
    if (payment.stripeSessionId && seenSessionIds.has(payment.stripeSessionId)) continue;
    if (payment.stripeSessionId) seenSessionIds.add(payment.stripeSessionId);
    items.push({
      id: payment.id,
      source: "payment",
      kind: BillingRecordKind.WEBSITE_PACKAGE,
      label: "Website package",
      amountCents: payment.amountCents ?? payment.amount * 100,
      currency: payment.currency,
      status: payment.status,
      stripeSessionId: payment.stripeSessionId,
      stripePaymentIntentId: payment.stripePaymentIntentId,
      stripeSubscriptionId: payment.stripeSubscriptionId,
      projectId: project?.id ?? null,
      paidAt: payment.updatedAt.toISOString(),
      createdAt: payment.createdAt.toISOString(),
    });
  }

  const purchases = await prisma.creditLedger.findMany({
    where: { userId, reason: CreditLedgerReason.PURCHASE },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  for (const entry of purchases) {
    if (entry.stripePaymentId && seenSessionIds.has(entry.stripePaymentId)) continue;
    if (entry.stripePaymentId) seenSessionIds.add(entry.stripePaymentId);
    items.push({
      id: entry.id,
      source: "credit_ledger",
      kind: BillingRecordKind.CREDIT_PACK,
      label: `Credit purchase (+${entry.amount} credits)`,
      amountCents: 0,
      currency: "USD",
      status: PaymentStatus.PAID,
      stripeSessionId: entry.stripePaymentId,
      credits: entry.amount,
      paidAt: entry.createdAt.toISOString(),
      createdAt: entry.createdAt.toISOString(),
    });
  }

  if (user?.stripeCustomerId) {
    const stripe = getStripe();
    if (stripe) {
      try {
        const invoices = await stripe.invoices.list({
          customer: user.stripeCustomerId,
          limit: 24,
          status: "paid",
        });
        for (const invoice of invoices.data) {
          if (seenInvoiceIds.has(invoice.id)) continue;
          seenInvoiceIds.add(invoice.id);
          const subRef = invoice.parent?.subscription_details?.subscription;
          items.push({
            id: invoice.id,
            source: "stripe_invoice",
            kind: BillingRecordKind.INVOICE,
            label: invoice.description || invoice.lines.data[0]?.description || "Invoice",
            amountCents: invoice.amount_paid ?? invoice.total ?? 0,
            currency: (invoice.currency ?? "usd").toUpperCase(),
            status: invoice.status ?? "paid",
            stripeInvoiceId: invoice.id,
            stripeSubscriptionId: typeof subRef === "string" ? subRef : subRef?.id ?? null,
            paidAt: invoice.status_transitions?.paid_at
              ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
              : null,
            createdAt: new Date(invoice.created * 1000).toISOString(),
          });
        }
      } catch (err) {
        console.error(
          "[billing] Stripe invoice list failed:",
          err instanceof Error ? err.message : err
        );
      }
    }
  }

  items.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return items;
}
