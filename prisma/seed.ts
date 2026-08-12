import { PrismaClient } from "@prisma/client";
import { ALL_SEEDS, assertSeedTemplatesValid } from "../lib/templates/registry";

const prisma = new PrismaClient();

async function main() {
  assertSeedTemplatesValid();

  for (const seed of ALL_SEEDS) {
    const data = {
      name: seed.name,
      tagline: seed.tagline,
      bestFor: seed.bestFor,
      thumbnailUrl: seed.thumbnailUrl,
      previewImageUrl: seed.previewImageUrl,
      accent: seed.accent,
      colorPreference: seed.colorPreference,
      visualStyle: seed.visualStyle,
      tone: seed.tone,
      sections: JSON.stringify(seed.sections),
      renderer: seed.renderer,
      published: seed.published,
      sortOrder: seed.sortOrder,
    };

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
