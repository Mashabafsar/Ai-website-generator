import { prisma } from "@/lib/prisma";
import { CreditLedgerReason, PaymentStatus, PaymentType } from "@/lib/constants";

async function main() {
  const q = process.argv[2] ?? "taxi";
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { project: { businessName: { contains: q, mode: "insensitive" } } },
        { project: { slug: { contains: q, mode: "insensitive" } } },
      ],
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
          slug: true,
          payments: {
            where: { status: PaymentStatus.PAID },
            select: {
              id: true,
              type: true,
              amount: true,
              amountCents: true,
              createdAt: true,
              hubspotDealId: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
      ledger: {
        where: { reason: CreditLedgerReason.PURCHASE },
        select: { id: true, amount: true, createdAt: true, stripePaymentId: true },
        orderBy: { createdAt: "asc" },
      },
      crmProfile: {
        select: {
          hubspotDealId: true,
          hubspotContactId: true,
          hubspotLastError: true,
          hubspotDealNoteId: true,
        },
      },
      crmJobs: {
        where: { kind: "PURCHASE_DEAL" },
        select: {
          id: true,
          status: true,
          lastError: true,
          createdAt: true,
          updatedAt: true,
          attempts: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      },
      scoreEvents: {
        where: { action: "CREDIT_PACK_PURCHASED" },
        select: { id: true, points: true, createdAt: true, idempotencyKey: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
    take: 20,
  });

  // Also: LIVE projects that bought credits after a website payment.
  const liveWithCredits = await prisma.user.findMany({
    where: {
      project: {
        status: { in: ["LIVE", "PAID", "EXPORTED", "DEPLOYING"] },
        payments: {
          some: { type: PaymentType.WEBSITE_PACKAGE, status: PaymentStatus.PAID },
        },
      },
      ledger: { some: { reason: CreditLedgerReason.PURCHASE } },
    },
    select: {
      email: true,
      project: { select: { businessName: true, status: true, slug: true } },
      crmProfile: { select: { hubspotDealId: true, hubspotLastError: true } },
      ledger: {
        where: { reason: CreditLedgerReason.PURCHASE },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
      crmJobs: {
        where: { kind: "PURCHASE_DEAL" },
        select: { status: true, lastError: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 15,
  });

  console.log("--- search ---");
  console.log(JSON.stringify(users, null, 2));
  console.log("--- live+credits ---");
  console.log(JSON.stringify(liveWithCredits, null, 2));
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
