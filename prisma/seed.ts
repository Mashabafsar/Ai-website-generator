import { PrismaClient } from "@prisma/client";
import { ALL_SEEDS, assertSeedTemplatesValid } from "../lib/templates/registry";
import { resolveSeedPages, serializeTemplatePages } from "../lib/templates/pages";

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
      // Always store the multi-page structure; single-page designs resolve to a
      // single "home" page, and the parser also still reads the legacy array.
      sections: serializeTemplatePages(resolveSeedPages(seed)),
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
