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
 * fits. Each incoming page must be one the design supports and must carry
 * exactly that page's slot list, in order; a "home" page is always required.
 * The other pages may be a subset — the ones the AI chose to generate.
 *
 * A slot accepts its locked variant, or one that variant declares it supersedes
 * so projects generated before a slot was corrected keep saving.
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
    if (incoming.length !== expected.length) {
      return `page "${page.slug}" has ${incoming.length} section(s), the design locks ${expected.length}`;
    }
    for (const [i, variant] of incoming.entries()) {
      if (variant === expected[i] || acceptsSupersededVariant(expected[i], variant)) continue;
      return `page "${page.slug}" slot ${i} is "${variant}", the design locks "${expected[i]}"`;
    }
  }

  return null;
}
