/**
 * Targeted HubSpot deal resync for Taxia / XERDPL1 (or a similar query).
 * Does NOT backfill every account.
 *
 *   node --env-file-if-exists=.env --import tsx scripts/resync-taxia-deal.ts [query]
 */
import { prisma } from "@/lib/prisma";
import { CREDIT_PACKS, CreditLedgerReason, PaymentStatus, PaymentType } from "@/lib/constants";
import { computeCombinedScore } from "@/lib/crm/config";
import { syncAccountDeal } from "@/lib/crm/sync";
import { hubspotRequest, isHubSpotConfigured } from "@/lib/crm/hubspot-client";

async function findUsers(query: string) {
  return prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
        { project: { businessName: { contains: query, mode: "insensitive" } } },
        { project: { slug: { contains: query, mode: "insensitive" } } },
        { project: { questionnaire: { answers: { contains: query, mode: "insensitive" } } } },
      ],
    },
    select: {
      id: true,
      email: true,
      name: true,
      project: { select: { businessName: true, slug: true, status: true } },
      crmProfile: { select: { hubspotDealId: true } },
      ledger: {
        where: { reason: CreditLedgerReason.PURCHASE },
        select: { amount: true },
      },
      scoreEvents: { select: { action: true, points: true } },
    },
    take: 20,
  });
}

async function searchHubSpotDeals(query: string) {
  const r = await hubspotRequest<{
    results?: { id: string; properties?: Record<string, string | null> }[];
  }>("/crm/v3/objects/deals/search", {
    method: "POST",
    body: JSON.stringify({
      query,
      properties: ["dealname", "amount", "dealstage", "description", "pipeline"],
      limit: 10,
    }),
  });
  return r.results ?? [];
}

async function readDeal(dealId: string) {
  const r = await hubspotRequest<{
    results?: { properties?: Record<string, string | null> }[];
  }>("/crm/v3/objects/deals/search", {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [
        { filters: [{ propertyName: "hs_object_id", operator: "EQ", value: dealId }] },
      ],
      properties: ["dealname", "amount", "dealstage", "description", "pipeline", "closedate"],
      limit: 1,
    }),
  });
  return r.results?.[0]?.properties ?? null;
}

async function expected(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      project: { include: { payments: true } },
      ledger: { where: { reason: CreditLedgerReason.PURCHASE } },
      scoreEvents: { select: { action: true, points: true } },
      crmProfile: true,
    },
  });
  const website = user.project?.payments.find(
    (p) => p.type === PaymentType.WEBSITE_PACKAGE && p.status === PaymentStatus.PAID
  );
  const websiteDollars = website
    ? website.amountCents != null
      ? website.amountCents / 100
      : website.amount
    : 0;
  const creditDollars = user.ledger.reduce((sum, entry) => {
    const pack = CREDIT_PACKS.find((p) => p.credits === entry.amount);
    return sum + (pack?.priceUsd ?? 0);
  }, 0);
  return {
    email: user.email,
    business: user.project?.businessName,
    dealId: user.crmProfile?.hubspotDealId,
    expectedTotal: websiteDollars + creditDollars,
    creditPacks: user.ledger.length,
    score: computeCombinedScore(user.scoreEvents),
  };
}

async function main() {
  const queries = process.argv.slice(2);
  const terms = queries.length > 0 ? queries : ["Taxia", "XERDPL", "XERDPL1", "taxia"];

  if (!isHubSpotConfigured()) {
    console.error("HUBSPOT_API_KEY unset — cannot resync.");
    process.exit(1);
  }

  const seen = new Set<string>();
  const matches: Awaited<ReturnType<typeof findUsers>> = [];

  for (const term of terms) {
    for (const user of await findUsers(term)) {
      if (seen.has(user.id)) continue;
      seen.add(user.id);
      matches.push(user);
    }
    try {
      const deals = await searchHubSpotDeals(term);
      console.log(
        `HubSpot deals for "${term}":`,
        deals.map((d) => ({
          id: d.id,
          name: d.properties?.dealname,
          amount: d.properties?.amount,
        }))
      );
    } catch (err) {
      console.error(`HubSpot search "${term}" failed:`, err instanceof Error ? err.message : err);
    }
  }

  if (matches.length === 0) {
    console.log("No local accounts matched Taxia / XERDPL1 / similar. Nothing to resync.");
    process.exit(0);
  }

  for (const user of matches) {
    console.log("Resyncing", user.email, user.project?.businessName);
    const before = await expected(user.id);
    console.log("before", before);
    await syncAccountDeal(user.id);
    const after = await expected(user.id);
    console.log("after", after);
    if (after.dealId) {
      const hubspot = await readDeal(after.dealId);
      console.log("hubspot", {
        dealname: hubspot?.dealname,
        amount: hubspot?.amount,
        dealstage: hubspot?.dealstage,
        hasCreditLine: /credit pack/i.test(hubspot?.description ?? ""),
        hasScore: /Deal score:/i.test(hubspot?.description ?? ""),
        descriptionPreview: (hubspot?.description ?? "").slice(0, 600),
      });
    }
  }
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
