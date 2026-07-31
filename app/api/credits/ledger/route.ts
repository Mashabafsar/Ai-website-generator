import { requireUser, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const entries = await prisma.creditLedger.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      amount: true,
      balanceAfter: true,
      reason: true,
      createdAt: true,
    },
  });

  return jsonOk({ entries });
}
