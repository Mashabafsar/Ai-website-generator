import { prisma } from "@/lib/prisma";
import { CreditLedgerReason, PaymentStatus, PaymentType } from "@/lib/constants";

async function main() {
  const payments = await prisma.payment.findMany({
    where: { type: PaymentType.WEBSITE_PACKAGE, status: PaymentStatus.PAID },
    orderBy: { createdAt: "desc" },
    take: 25,
    select: {
      id: true,
      amount: true,
      amountCents: true,
      createdAt: true,
      hubspotDealId: true,
      project: {
        select: {
          businessName: true,
          status: true,
          slug: true,
          user: {
            select: {
              id: true,
              email: true,
              crmProfile: {
                select: { hubspotDealId: true, hubspotLastError: true },
              },
              ledger: {
                where: { reason: CreditLedgerReason.PURCHASE },
                select: { amount: true, createdAt: true },
                orderBy: { createdAt: "asc" },
              },
              scoreEvents: {
                where: { action: "CREDIT_PACK_PURCHASED" },
                select: { createdAt: true, points: true, idempotencyKey: true },
                orderBy: { createdAt: "desc" },
                take: 5,
              },
              crmJobs: {
                where: { kind: "PURCHASE_DEAL" },
                select: { status: true, lastError: true, updatedAt: true },
                orderBy: { updatedAt: "desc" },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  for (const p of payments) {
    const u = p.project.user;
    console.log(
      JSON.stringify({
        business: p.project.businessName,
        status: p.project.status,
        email: u.email,
        websitePaidAt: p.createdAt,
        websiteAmount: p.amount,
        websiteCents: p.amountCents,
        dealId: u.crmProfile?.hubspotDealId ?? p.hubspotDealId,
        credits: u.ledger,
        creditScores: u.scoreEvents,
        dealJob: u.crmJobs[0] ?? null,
        lastError: u.crmProfile?.hubspotLastError ?? null,
      })
    );
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
