// Deactivate abandoned accounts after 14 days when they never bought a website
// package or a credit pack. Paying customers and admins are never touched.

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/auth/admin";
import {
  CreditLedgerReason,
  PAID_PROJECT_STATUSES,
  PaymentStatus,
  PaymentType,
} from "@/lib/constants";

/** Days after signup before an unpaid, no-credit-purchase account is locked. */
export const ACCOUNT_INACTIVITY_DAYS = 14;

export const DEACTIVATION_REASON_STALE =
  "No website package or credit pack purchase within 14 days";

export function accountAgeCutoff(now = new Date()): Date {
  return new Date(now.getTime() - ACCOUNT_INACTIVITY_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * Pure rule used by tests and the worker.
 * Protected: admin, already deactivated, paid website, or credit pack purchase.
 */
export function shouldDeactivateAccount(input: {
  createdAt: Date;
  isAdmin?: boolean;
  deactivatedAt?: Date | null;
  hasWebsitePurchase: boolean;
  hasCreditPurchase: boolean;
  now?: Date;
}): boolean {
  if (input.isAdmin) return false;
  if (input.deactivatedAt) return false;
  if (input.hasWebsitePurchase) return false;
  if (input.hasCreditPurchase) return false;
  return input.createdAt.getTime() < accountAgeCutoff(input.now).getTime();
}

/** Prisma filter for accounts that match the deactivation rule. */
export function eligibleForDeactivationWhere(now = new Date()): Prisma.UserWhereInput {
  const cutoff = accountAgeCutoff(now);
  return {
    deactivatedAt: null,
    isAdmin: false,
    createdAt: { lt: cutoff },
    AND: [
      {
        OR: [
          { project: null },
          {
            project: {
              AND: [
                {
                  payments: {
                    none: {
                      type: PaymentType.WEBSITE_PACKAGE,
                      status: PaymentStatus.PAID,
                    },
                  },
                },
                { status: { notIn: [...PAID_PROJECT_STATUSES] } },
              ],
            },
          },
        ],
      },
      {
        ledger: {
          none: { reason: CreditLedgerReason.PURCHASE },
        },
      },
    ],
  };
}

export async function listAccountsEligibleForDeactivation(options?: {
  limit?: number;
  now?: Date;
}) {
  // Fetch a bit over the limit so allowlisted admin emails can be filtered out.
  const take = options?.limit ? options.limit + 50 : undefined;
  const rows = await prisma.user.findMany({
    where: eligibleForDeactivationWhere(options?.now),
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      project: { select: { status: true, businessName: true } },
    },
    orderBy: { createdAt: "asc" },
    ...(take ? { take } : {}),
  });
  const filtered = rows.filter((row) => !isAdminEmail(row.email));
  return options?.limit ? filtered.slice(0, options.limit) : filtered;
}

export async function isAccountDeactivated(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { deactivatedAt: true },
  });
  return Boolean(user?.deactivatedAt);
}

/**
 * Mark eligible accounts deactivated and revoke their sessions.
 * Returns how many were deactivated.
 */
export async function deactivateEligibleAccounts(options?: {
  dryRun?: boolean;
  limit?: number;
  now?: Date;
}): Promise<{
  dryRun: boolean;
  eligible: number;
  deactivated: number;
  accounts: { id: string; email: string; createdAt: Date }[];
}> {
  const dryRun = Boolean(options?.dryRun);
  const eligible = await listAccountsEligibleForDeactivation({
    limit: options?.limit,
    now: options?.now,
  });

  if (dryRun || eligible.length === 0) {
    return {
      dryRun,
      eligible: eligible.length,
      deactivated: 0,
      accounts: eligible.map((u) => ({
        id: u.id,
        email: u.email,
        createdAt: u.createdAt,
      })),
    };
  }

  const now = options?.now ?? new Date();
  const ids = eligible.map((u) => u.id);

  await prisma.$transaction([
    prisma.user.updateMany({
      where: { id: { in: ids }, deactivatedAt: null },
      data: {
        deactivatedAt: now,
        deactivatedReason: DEACTIVATION_REASON_STALE,
      },
    }),
    prisma.session.deleteMany({
      where: { userId: { in: ids } },
    }),
  ]);

  return {
    dryRun: false,
    eligible: eligible.length,
    deactivated: ids.length,
    accounts: eligible.map((u) => ({
      id: u.id,
      email: u.email,
      createdAt: u.createdAt,
    })),
  };
}
