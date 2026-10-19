// Catalog columns written from the local template registry. Shared by the Prisma
// seed and scripts/populate-templates.ts so the two stay on one mapping.
// `published` and `sortOrder` are included for inserts and for the seed, which
// still writes them. The populate script omits them on update.

import { resolveSeedPages, serializeTemplatePages } from "./pages";
import type { TemplateSeed } from "./registry";

export type TemplateCatalogData = {
  name: string;
  tagline: string;
  bestFor: string;
  thumbnailUrl: string;
  previewImageUrl: string;
  accent: string;
  colorPreference: string;
  visualStyle: string;
  tone: string;
  sections: string;
  renderer: string;
  published: boolean;
  sortOrder: number;
};

/** Fields an admin may change in the database. The populate script does not overwrite these. */
const ADMIN_FIELDS = ["published", "sortOrder"] as const;

const CATALOG_FIELDS = [
  "name",
  "tagline",
  "bestFor",
  "thumbnailUrl",
  "previewImageUrl",
  "accent",
  "colorPreference",
  "visualStyle",
  "tone",
  "sections",
  "renderer",
] as const satisfies readonly Exclude<keyof TemplateCatalogData, (typeof ADMIN_FIELDS)[number]>[];

export type TemplateCatalogUpdate = Pick<TemplateCatalogData, (typeof CATALOG_FIELDS)[number]>;

export function templateCatalogData(seed: TemplateSeed): TemplateCatalogData {
  return {
    name: seed.name,
    tagline: seed.tagline,
    bestFor: seed.bestFor,
    thumbnailUrl: seed.thumbnailUrl,
    previewImageUrl: seed.previewImageUrl,
    accent: seed.accent,
    colorPreference: seed.colorPreference,
    visualStyle: seed.visualStyle,
    tone: seed.tone,
    // Always store the multi-page structure. Single-page designs resolve to one
    // "home" page, and the parser still accepts the older flat array.
    sections: serializeTemplatePages(resolveSeedPages(seed)),
    renderer: seed.renderer,
    published: seed.published,
    sortOrder: seed.sortOrder,
  };
}

export function templateCatalogUpdate(data: TemplateCatalogData): TemplateCatalogUpdate {
  const update = {} as TemplateCatalogUpdate;
  for (const field of CATALOG_FIELDS) {
    update[field] = data[field];
  }
  return update;
}

export function catalogFieldsMatch(current: TemplateCatalogUpdate, next: TemplateCatalogUpdate): boolean {
  return CATALOG_FIELDS.every((field) => current[field] === next[field]);
}
