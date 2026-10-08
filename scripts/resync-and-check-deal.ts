import { prisma } from "@/lib/prisma";
import { syncAccountDeal } from "@/lib/crm/sync";
import { hubspotRequest, objectPath } from "@/lib/crm/hubspot-client";
import { CREDIT_PACKS, CreditLedgerReason } from "@/lib/constants";

async function expectedAmount(userId: string): Promise<{
  email: string;
  business: string;
  dealId: string | null;
  websiteDollars: number;
  creditDollars: number;
  total: number;
  creditLines: string[];
}> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      project: {
        include: {
          quote: true,
          payments: true,
        },
      },
      crmProfile: true,
      ledger: {
        where: { reason: CreditLedgerReason.PURCHASE },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const website = user.project?.payments.find(
    (p) => p.type === "website_package" && p.status === "PAID"
  );
  const websiteDollars = website
    ? website.amountCents != null && website.amountCents > 0
      ? website.amountCents / 100
      : website.amount
    : 0;

  const creditLines = user.ledger.map((entry) => {
    const pack = CREDIT_PACKS.find((p) => p.credits === entry.amount);
    return {
      name: pack
        ? `${pack.label} credit pack (${pack.credits} credits)`
        : `Credit pack (${entry.amount} credits)`,
      amount: pack?.priceUsd ?? 0,
    };
  });
  const creditDollars = creditLines.reduce((s, l) => s + l.amount, 0);

  return {
    email: user.email,
    business: user.project?.businessName ?? "",
    dealId: user.crmProfile?.hubspotDealId ?? null,
    websiteDollars,
    creditDollars,
    total: websiteDollars + creditDollars,
    creditLines: creditLines.map((l) => `${l.name}: $${l.amount}`),
  };
}

async function main() {
  const emailOrId = process.argv[2];
  if (!emailOrId) {
    console.error("Pass user email");
    process.exit(1);
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: emailOrId }, { id: emailOrId }],
    },
    select: { id: true, email: true },
  });
  if (!user) {
    console.error("User not found");
    process.exit(1);
  }

  const before = await expectedAmount(user.id);
  console.log("expected", before);

  await syncAccountDeal(user.id);

  const after = await expectedAmount(user.id);
  console.log("after sync dealId", after.dealId);

  if (after.dealId) {
    try {
      const deal = await hubspotRequest<{
        properties?: Record<string, string | null>;
      }>(
        `${objectPath("deals", after.dealId)}?properties=dealname,amount,pipeline,dealstage,description`,
        { method: "GET" }
      );
      console.log("hubspot", {
        dealname: deal.properties?.dealname,
        amount: deal.properties?.amount,
        pipeline: deal.properties?.pipeline,
        dealstage: deal.properties?.dealstage,
        descriptionPreview: (deal.properties?.description ?? "").slice(0, 800),
      });
    } catch (err) {
      console.error("hubspot read failed:", err instanceof Error ? err.message : err);
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
