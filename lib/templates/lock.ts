// The template lock: which blueprints a fixed design accepts. A design is sold
// as a finished layout, so a save may change the words in a slot but never the
// pages, the slot count, the order, or a slot's section type.
//
// Shared by the editor save path and the stored-project sweep in
// scripts/validate-template-locks.ts, so a template edit cannot pass validation
// while breaking saves for projects already generated under the old slot list.
// No prisma / React imports, so the validation script can load it directly.

import { acceptsSupersededVariant } from "../sections/registry";
import { MANDATORY_PAGE } from "../blueprint/page-catalog";
import type { TemplatePageDef } from "./types";

type LockedBlueprint = {
  pages: { slug: string; sections: { variant: string }[] }[];
};

/**
 * Why `blueprint` no longer fits the design's locked layout, or null when it
 * fits. Each incoming page must be one the design supports. Home is required.
 * Other pages may be omitted. Kept pages may omit optional bands, but remaining
 * slots must stay in the design's order (a locked variant, or one it supersedes).
 */
export function findTemplateLockViolation(
  templatePages: TemplatePageDef[],
  blueprint: LockedBlueprint
): string | null {
  const bySlug = new Map(templatePages.map((p) => [p.slug, p.sections]));

  if (!blueprint.pages.some((p) => p.slug === MANDATORY_PAGE)) {
    return `missing the mandatory "${MANDATORY_PAGE}" page`;
  }

  const seen = new Set<string>();
  for (const page of blueprint.pages) {
    if (seen.has(page.slug)) return `page "${page.slug}" appears more than once`;
    seen.add(page.slug);

    const expected = bySlug.get(page.slug);
    if (!expected) return `page "${page.slug}" is not part of this design`;

    const incoming = page.sections.map((s) => s.variant);
    if (!incoming.length) return `page "${page.slug}" has no sections`;

    let slot = 0;
    for (const variant of incoming) {
      while (
        slot < expected.length &&
        variant !== expected[slot] &&
        !acceptsSupersededVariant(expected[slot], variant)
      ) {
        slot += 1;
      }
      if (slot >= expected.length) {
        return `page "${page.slug}" includes "${variant}", which is not in this design's order`;
      }
      slot += 1;
    }
  }

  return null;
}
