import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { CreditLedgerReason } from "@/lib/constants";

export class InsufficientCreditsError extends Error {
  required: number;
  available: number;
  constructor(required: number, available: number) {
    super(`Not enough credits. You need ${required}, you have ${available}.`);
    this.name = "InsufficientCreditsError";
    this.required = required;
    this.available = available;
  }
}

/** Ensure a wallet row exists for the user. */
async function ensureWallet(userId: string) {
  return prisma.creditWallet.upsert({
    where: { userId },
    create: { userId, balance: 0 },
    update: {},
  });
}

export async function getBalance(userId: string): Promise<number> {
  const wallet = await prisma.creditWallet.findUnique({ where: { userId } });
  return wallet?.balance ?? 0;
}

/**
 * Grant the one-time signup bonus. Idempotent: a fixed ledger idempotencyKey per
 * user guarantees it only ever applies once even if auth hooks fire twice.
 */
export async function grantSignupBonus(userId: string): Promise<void> {
  const amount = env.credits.signupBonus;
  const idempotencyKey = `signup_bonus:${userId}`;

  const existing = await prisma.creditLedger.findUnique({ where: { idempotencyKey } });
  if (existing) return;

  await prisma.$transaction(async (tx) => {
    const already = await tx.creditLedger.findUnique({ where: { idempotencyKey } });
    if (already) return;

    const wallet = await tx.creditWallet.upsert({
      where: { userId },
      create: { userId, balance: amount },
      update: { balance: { increment: amount } },
    });

    await tx.creditLedger.create({
      data: {
        userId,
        amount,
        balanceAfter: wallet.balance,
        reason: CreditLedgerReason.SIGNUP_BONUS,
        idempotencyKey,
      },
    });
  });
}

/**
 * Atomically verify the balance and spend credits. Never allows a negative
 * balance. Throws InsufficientCreditsError if the user cannot afford it.
 * `idempotencyKey` prevents double-charging on request retries.
 */
export async function assertAndSpend(params: {
  userId: string;
  amount: number;
  reason: string;
  projectId?: string;
  idempotencyKey: string;
}): Promise<{ balanceAfter: number; spent: boolean }> {
  const { userId, amount, reason, projectId, idempotencyKey } = params;
  await ensureWallet(userId);

  return prisma.$transaction(async (tx) => {
    const dup = await tx.creditLedger.findUnique({ where: { idempotencyKey } });
    if (dup) {
      const w = await tx.creditWallet.findUnique({ where: { userId } });
      return { balanceAfter: w?.balance ?? 0, spent: false };
    }

    // Decrement first so the wallet row is locked. A stale read-then-write
    // check would let two concurrent spends both pass and overdraw.
    const updated = await tx.creditWallet.update({
      where: { userId },
      data: { balance: { decrement: amount } },
    });
    if (updated.balance < 0) {
      throw new InsufficientCreditsError(amount, updated.balance + amount);
    }

    await tx.creditLedger.create({
      data: {
        userId,
        amount: -amount,
        balanceAfter: updated.balance,
        reason,
        projectId,
        idempotencyKey,
      },
    });

    return { balanceAfter: updated.balance, spent: true };
  });
}

/**
 * First attempt uses `base`; later attempts append `:aN` so a refunded spend
 * key is never reused (reusing it would make the retry free).
 */
export async function nextLedgerAttemptKey(params: {
  reason: string;
  base: string;
}): Promise<string> {
  const prior = await prisma.creditLedger.count({
    where: {
      reason: params.reason,
      idempotencyKey: { startsWith: params.base },
    },
  });
  return prior === 0 ? params.base : `${params.base}:a${prior}`;
}

/**
 * Refund a previously spent amount (best-effort). Keyed off the original spend's
 * idempotency key so a failed AI call refunds exactly once.
 */
export async function refundSpend(params: {
  userId: string;
  amount: number;
  projectId?: string;
  spendIdempotencyKey: string;
}): Promise<void> {
  const { userId, amount, projectId, spendIdempotencyKey } = params;
  const idempotencyKey = `refund:${spendIdempotencyKey}`;

  await prisma.$transaction(async (tx) => {
    const dup = await tx.creditLedger.findUnique({ where: { idempotencyKey } });
    if (dup) return;

    // Only refund if the original spend actually happened.
    const spend = await tx.creditLedger.findUnique({ where: { idempotencyKey: spendIdempotencyKey } });
    if (!spend) return;

    const wallet = await tx.creditWallet.upsert({
      where: { userId },
      create: { userId, balance: amount },
      update: { balance: { increment: amount } },
    });

    await tx.creditLedger.create({
      data: {
        userId,
        amount,
        balanceAfter: wallet.balance,
        reason: CreditLedgerReason.REFUND,
        projectId,
        idempotencyKey,
      },
    });
  });
}

/**
 * Grant purchased credits after a successful Stripe credit-pack payment.
 * Idempotent per Stripe payment/session id.
 */
export async function grantPurchase(params: {
  userId: string;
  credits: number;
  stripePaymentId: string;
}): Promise<void> {
  const { userId, credits, stripePaymentId } = params;
  const idempotencyKey = `purchase:${stripePaymentId}`;

  await prisma.$transaction(async (tx) => {
    const dup = await tx.creditLedger.findUnique({ where: { idempotencyKey } });
    if (dup) return;

    const wallet = await tx.creditWallet.upsert({
      where: { userId },
      create: { userId, balance: credits },
      update: { balance: { increment: credits } },
    });

    await tx.creditLedger.create({
      data: {
        userId,
        amount: credits,
        balanceAfter: wallet.balance,
        reason: CreditLedgerReason.PURCHASE,
        stripePaymentId,
        idempotencyKey,
      },
    });
  });
}
