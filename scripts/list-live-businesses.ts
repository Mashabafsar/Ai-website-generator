import { prisma } from "@/lib/prisma";

async function main() {
  const rows = await prisma.project.findMany({
    where: { status: { in: ["LIVE", "PAID", "EXPORTED", "DEPLOYING"] } },
    select: {
      businessName: true,
      status: true,
      slug: true,
      user: { select: { email: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 60,
  });
  for (const r of rows) {
    console.log(`${r.status}\t${r.businessName}\t${r.slug}\t${r.user.email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
