import { PrismaClient } from "@prisma/client";
import { templateCatalogData } from "../lib/templates/catalog-data";
import { ALL_SEEDS, assertSeedTemplatesValid } from "../lib/templates/registry";

const prisma = new PrismaClient();

async function main() {
  assertSeedTemplatesValid();

  for (const seed of ALL_SEEDS) {
    const data = templateCatalogData(seed);
    await prisma.template.upsert({
      where: { slug: seed.slug },
      create: { slug: seed.slug, ...data },
      update: data,
    });
  }

  console.log(`Seeded ${ALL_SEEDS.length} templates.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
