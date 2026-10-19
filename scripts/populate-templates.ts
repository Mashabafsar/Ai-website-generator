/**
 * Upsert the local template catalog into Postgres.
 *
 *   npm run templates:populate
 *
 * Inserts registry slugs that are missing and updates catalog fields on rows
 * that already exist. Does not delete database-only templates, and does not
 * change `published` or `sortOrder` on update.
 */

import { PrismaClient } from "@prisma/client";
import { catalogFieldsMatch, templateCatalogData, templateCatalogUpdate } from "../lib/templates/catalog-data";
import { ALL_SEEDS, assertSeedTemplatesValid } from "../lib/templates/registry";

const prisma = new PrismaClient({ log: [] });

const catalogSelect = {
  slug: true,
  name: true,
  tagline: true,
  bestFor: true,
  thumbnailUrl: true,
  previewImageUrl: true,
  accent: true,
  colorPreference: true,
  visualStyle: true,
  tone: true,
  sections: true,
  renderer: true,
} as const;

function publicError(error: unknown): string {
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
  return message.replace(/postgres(?:ql)?:\/\/\S+/gi, "postgresql://[redacted]");
}

async function populateTemplates(): Promise<{ inserted: number; updated: number; unchanged: number }> {
  assertSeedTemplatesValid();

  const writes = ALL_SEEDS.map((seed) => ({
    slug: seed.slug,
    data: templateCatalogData(seed),
  }));

  return prisma.$transaction(async (tx) => {
    const existing = await tx.template.findMany({
      where: { slug: { in: writes.map((write) => write.slug) } },
      select: catalogSelect,
    });
    const bySlug = new Map(existing.map((row) => [row.slug, row]));

    let inserted = 0;
    let updated = 0;
    let unchanged = 0;

    for (const write of writes) {
      const current = bySlug.get(write.slug);
      if (!current) {
        await tx.template.create({
          data: { slug: write.slug, ...write.data },
        });
        inserted += 1;
        continue;
      }

      const next = templateCatalogUpdate(write.data);
      if (catalogFieldsMatch(current, next)) {
        unchanged += 1;
        continue;
      }

      await tx.template.update({
        where: { slug: write.slug },
        data: next,
      });
      updated += 1;
    }

    return { inserted, updated, unchanged };
  }, { timeout: 60_000 });
}

async function main() {
  const summary = await populateTemplates();
  console.log(`inserted ${summary.inserted}, updated ${summary.updated}, unchanged ${summary.unchanged}`);
}

main()
  .catch((error: unknown) => {
    console.error(publicError(error));
    process.exitCode = 1;
  })
  .finally(() => {
    return prisma.$disconnect().catch((error: unknown) => {
      console.error(publicError(error));
      process.exitCode = 1;
    });
  });
