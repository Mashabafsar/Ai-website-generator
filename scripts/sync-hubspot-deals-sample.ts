/**
 * Create/update HubSpot deals for a small sample of accounts that have a
 * questionnaire — not a full backfill.
 *
 * Usage:
 *   npm run hubspot:deals-sample              # dry run
 *   npm run hubspot:deals-sample -- --apply   # write to HubSpot
 *   npm run hubspot:deals-sample -- --apply --limit 3
 */

import { prisma } from "@/lib/prisma";
import { isHubSpotConfigured } from "@/lib/crm/hubspot-client";
import { resolveDealStage } from "@/lib/crm/config";
import { syncAccountDeal, syncContact } from "@/lib/crm/sync";
import { CreditLedgerReason, PaymentStatus, PaymentType } from "@/lib/constants";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const limit = Math.min(Math.max(Number(argValue("--limit") ?? "3") || 3, 1), 3);

  if (!isHubSpotConfigured()) {
    console.error("HUBSPOT_API_KEY is unset. Set it in .env and retry.");
    process.exit(1);
  }

  const users = await prisma.user.findMany({
    where: {
      email: { not: { endsWith: ".test" } },
      project: { questionnaire: { isNot: null } },
    },
    select: {
      id: true,
      email: true,
      name: true,
      project: {
        select: {
          id: true,
          businessName: true,
          status: true,
          blueprint: true,
          assembledPages: true,
          quote: { select: { id: true } },
        },
      },
      crmProfile: {
        select: { hubspotContactId: true, hubspotDealId: true, hubspotLeadId: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  if (users.length === 0) {
    console.log("No accounts with a questionnaire found.");
    return;
  }

  console.log(`Sample size: ${users.length} (max 3). ${apply ? "APPLYING to HubSpot." : "Dry run."}`);

  for (const user of users) {
    const project = user.project;
    if (!project) continue;

    const creditPurchases = await prisma.creditLedger.count({
      where: { userId: user.id, reason: CreditLedgerReason.PURCHASE },
    });
    const websitePaid = await prisma.payment.findFirst({
      where: {
        projectId: project.id,
        type: PaymentType.WEBSITE_PACKAGE,
        status: PaymentStatus.PAID,
      },
      select: { id: true },
    });

    const stage = resolveDealStage({
      websitePaid: Boolean(websitePaid),
      hasQuote: Boolean(project.quote),
      hasCreditPurchase: creditPurchases > 0,
      hasGeneratedContent: Boolean(project.blueprint || project.assembledPages),
    });

    console.log(
      [
        `- ${user.email}`,
        `business=${project.businessName}`,
        `status=${project.status}`,
        `stage=${stage}`,
        `existingDeal=${user.crmProfile?.hubspotDealId ?? "none"}`,
      ].join(" | ")
    );

    if (!apply) continue;

    await syncContact(user.id);
    await syncAccountDeal(user.id);

    const after = await prisma.crmProfile.findUnique({
      where: { userId: user.id },
      select: { hubspotDealId: true, hubspotContactId: true, hubspotLeadId: true },
    });
    console.log(
      `  → contact=${after?.hubspotContactId ?? "?"} lead=${after?.hubspotLeadId ?? "?"} deal=${after?.hubspotDealId ?? "MISSING"}`
    );
  }

  if (!apply) {
    console.log("Dry run complete. Re-run with --apply to create/update these deals in HubSpot.");
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
