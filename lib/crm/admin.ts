// Read-only queries for the admin clients ledger. Scoring, consent, purchases,
// and HubSpot ids all come from our database — HubSpot is never queried here.

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CREDIT_PACKS, CreditLedgerReason, PaymentStatus, PaymentType } from "@/lib/constants";
import { CrmScoreAction } from "@/lib/crm/config";
import {
  type ClientListQuery,
  parseClientListQuery,
  clientListSearchParams,
} from "@/lib/crm/admin-query";
import { env } from "@/lib/env";
import { publicSiteUrl } from "@/lib/deployment/url";

export type { ClientListQuery, ClientSort, ConsentFilter } from "@/lib/crm/admin-query";
export { parseClientListQuery, clientListSearchParams };

const SCORE_LABELS: Record<string, string> = {
  [CrmScoreAction.REGISTERED]: "Registered",
  [CrmScoreAction.THEME_SELECTED]: "Selected a theme",
  [CrmScoreAction.QUESTIONNAIRE_COMPLETED]: "Completed questionnaire",
  [CrmScoreAction.CREDIT_PACK_PURCHASED]: "Credit pack purchase",
};

export function scoreActionLabel(action: string): string {
  return SCORE_LABELS[action] ?? action.replace(/_/g, " ").toLowerCase();
}

export function creditPackFromCredits(credits: number) {
  return CREDIT_PACKS.find((pack) => pack.credits === credits) ?? null;
}

function projectUrl(
  projectId: string,
  deployment: { subdomain: string | null; liveUrl: string | null } | null
): string {
  return (
    publicSiteUrl(deployment) ??
    `${env.appUrl.replace(/\/$/, "")}/app/project/${projectId}/preview`
  );
}

function parseLineItems(json: string | null | undefined): { name: string; amount: number }[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as { name: string; amount: number }[]) : [];
  } catch {
    return [];
  }
}

function listWhere(query: ClientListQuery): Prisma.UserWhereInput {
  const clauses: Prisma.UserWhereInput[] = [];

  if (query.q) {
    clauses.push({
      OR: [
        { name: { contains: query.q, mode: "insensitive" } },
        { email: { contains: query.q, mode: "insensitive" } },
      ],
    });
  }

  if (query.consent === "yes") {
    clauses.push({ crmProfile: { is: { marketingConsent: true } } });
  } else if (query.consent === "no") {
    clauses.push({
      OR: [{ crmProfile: null }, { crmProfile: { is: { marketingConsent: false } } }],
    });
  }

  return clauses.length > 0 ? { AND: clauses } : {};
}

function listOrderBy(query: ClientListQuery): Prisma.UserOrderByWithRelationInput[] {
  const dir = query.order;
  switch (query.sort) {
    case "name":
      return [{ name: dir }, { createdAt: "desc" }];
    case "email":
      return [{ email: dir }, { createdAt: "desc" }];
    case "createdAt":
      return [{ createdAt: dir }];
    case "leadScore":
    default:
      return [{ crmProfile: { leadScore: dir } }, { createdAt: "desc" }];
  }
}

export type ClientListRow = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  leadScore: number;
  marketingConsent: boolean;
  marketingConsentAt: Date | null;
  hubspotContactId: string | null;
  hubspotLastSyncedAt: Date | null;
  hubspotLastError: string | null;
};

export async function listClients(query: ClientListQuery): Promise<{
  rows: ClientListRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}> {
  const where = listWhere(query);
  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: listOrderBy(query),
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        crmProfile: {
          select: {
            leadScore: true,
            marketingConsent: true,
            marketingConsentAt: true,
            hubspotContactId: true,
            hubspotLastSyncedAt: true,
            hubspotLastError: true,
          },
        },
      },
    }),
  ]);

  return {
    rows: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      leadScore: user.crmProfile?.leadScore ?? 0,
      marketingConsent: user.crmProfile?.marketingConsent ?? false,
      marketingConsentAt: user.crmProfile?.marketingConsentAt ?? null,
      hubspotContactId: user.crmProfile?.hubspotContactId ?? null,
      hubspotLastSyncedAt: user.crmProfile?.hubspotLastSyncedAt ?? null,
      hubspotLastError: user.crmProfile?.hubspotLastError ?? null,
    })),
    total,
    page: query.page,
    pageSize: query.pageSize,
    pageCount: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function listClientsForExport(query: Omit<ClientListQuery, "page" | "pageSize">) {
  const result = await listClients({ ...query, page: 1, pageSize: 10_000 });
  return result.rows;
}

export function clientsToCsv(rows: ClientListRow[]): string {
  const header = [
    "name",
    "email",
    "registered",
    "lead_score",
    "marketing_consent",
    "consent_at",
    "hubspot_contact_id",
    "hubspot_last_synced",
    "hubspot_last_error",
  ];

  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const iso = (value: Date | null) => (value ? value.toISOString() : "");

  const lines = rows.map((row) =>
    [
      row.name,
      row.email,
      iso(row.createdAt),
      String(row.leadScore),
      row.marketingConsent ? "yes" : "no",
      iso(row.marketingConsentAt),
      row.hubspotContactId ?? "",
      iso(row.hubspotLastSyncedAt),
      row.hubspotLastError ?? "",
    ]
      .map(escape)
      .join(",")
  );

  return [header.join(","), ...lines].join("\n");
}

export type ClientDetail = ClientListRow & {
  scoreEvents: { id: string; action: string; label: string; points: number; createdAt: Date }[];
  creditPurchases: {
    id: string;
    packLabel: string;
    credits: number;
    priceUsd: number | null;
    createdAt: Date;
  }[];
  websitePurchases: {
    id: string;
    websiteUrl: string;
    price: number;
    currency: string;
    breakdown: { name: string; amount: number }[];
    createdAt: Date;
    hubspotDealId: string | null;
  }[];
};

export async function getClientDetail(userId: string): Promise<ClientDetail | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      crmProfile: true,
      scoreEvents: { orderBy: { createdAt: "asc" } },
      ledger: {
        where: { reason: CreditLedgerReason.PURCHASE },
        orderBy: { createdAt: "desc" },
      },
      project: {
        include: {
          deployment: true,
          payments: {
            where: { type: PaymentType.WEBSITE_PACKAGE, status: PaymentStatus.PAID },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    leadScore: user.crmProfile?.leadScore ?? 0,
    marketingConsent: user.crmProfile?.marketingConsent ?? false,
    marketingConsentAt: user.crmProfile?.marketingConsentAt ?? null,
    hubspotContactId: user.crmProfile?.hubspotContactId ?? null,
    hubspotLastSyncedAt: user.crmProfile?.hubspotLastSyncedAt ?? null,
    hubspotLastError: user.crmProfile?.hubspotLastError ?? null,
    scoreEvents: user.scoreEvents.map((event) => ({
      id: event.id,
      action: event.action,
      label: scoreActionLabel(event.action),
      points: event.points,
      createdAt: event.createdAt,
    })),
    creditPurchases: user.ledger.map((entry) => {
      const pack = creditPackFromCredits(entry.amount);
      return {
        id: entry.id,
        packLabel: pack?.label ?? `${entry.amount} credits`,
        credits: entry.amount,
        priceUsd: pack?.priceUsd ?? null,
        createdAt: entry.createdAt,
      };
    }),
    websitePurchases: (user.project?.payments ?? []).map((payment) => ({
      id: payment.id,
      websiteUrl: projectUrl(user.project!.id, user.project!.deployment),
      price: payment.amountCents != null ? payment.amountCents / 100 : payment.amount,
      currency: payment.currency,
      breakdown: parseLineItems(payment.breakdown),
      createdAt: payment.createdAt,
      hubspotDealId: payment.hubspotDealId,
    })),
  };
}

