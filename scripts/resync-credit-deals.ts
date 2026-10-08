/**
 * Re-push HubSpot deals for accounts that bought a website and later bought
 * credit packs, so amount + description include those credits.
 *
 *   npm run hubspot:resync-credits
 */

import { prisma } from "@/lib/prisma";
import { CreditLedgerReason, PaymentStatus, PaymentType } from "@/lib/constants";
import { syncAccountDeal } from "@/lib/crm/sync";
import { isHubSpotConfigured } from "@/lib/crm/hubspot-client";

async function main() {
  if (!isHubSpotConfigured()) {
    console.error("HUBSPOT_API_KEY is unset.");
    process.exit(1);
  }

  const users = await prisma.user.findMany({
    where: {
      project: {
        payments: {
          some: { type: PaymentType.WEBSITE_PACKAGE, status: PaymentStatus.PAID },
        },
      },
      ledger: { some: { reason: CreditLedgerReason.PURCHASE } },
    },
    select: {
      id: true,
      email: true,
      project: { select: { businessName: true } },
      crmProfile: { select: { hubspotDealId: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  console.log(`Resyncing ${users.length} website + credit account(s)…`);

  for (const user of users) {
    try {
      await syncAccountDeal(user.id);
      const after = await prisma.crmProfile.findUnique({
        where: { userId: user.id },
        select: { hubspotDealId: true },
      });
      console.log(
        `✓ ${user.email} (${user.project?.businessName}) deal=${after?.hubspotDealId ?? "none"}`
      );
    } catch (err) {
      console.error(
        `✗ ${user.email}:`,
        err instanceof Error ? err.message : err
      );
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
