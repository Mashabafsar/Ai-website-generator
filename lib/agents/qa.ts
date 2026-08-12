import type { SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { getVariantSpec } from "@/lib/sections/registry";

export type QaReport = {
  passed: boolean;
  warnings: string[];
  errors: string[];
};

/**
 * QA Agent — rules-based checks on the generated blueprint before it's shown or
 * shipped. Errors block a clean pass; warnings are surfaced to the user.
 */
export function runQa(blueprint: WebsiteBlueprint, contact?: SiteContact): QaReport {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!blueprint.pages.length) errors.push("No pages were generated.");

  const allTypes = new Set<string>();
  for (const page of blueprint.pages) {
    if (!page.sections.length) errors.push(`Page "${page.title}" has no sections.`);
    for (const section of page.sections) {
      allTypes.add(section.type);
      const spec = getVariantSpec(section.variant);
      if (!spec) {
        errors.push(`Unknown section variant "${section.variant}".`);
        continue;
      }
      for (const field of spec.fields) {
        if (!field.required) continue;
        const value = section.content[field.key];
        const empty =
          value === undefined ||
          (typeof value === "string" && value.trim() === "") ||
          (Array.isArray(value) && value.length === 0);
        if (empty) {
          warnings.push(`"${section.variant}" is missing ${field.key}.`);
        }
      }
    }
  }

  // Some designs carry contact details in the header and closing CTA rather than
  // a dedicated block, so only flag sites a visitor genuinely cannot reach.
  const reachable = allTypes.has("contact") || Boolean(contact?.email || contact?.phone);
  if (!reachable) warnings.push("Visitors have no way to get in touch.");
  if (!allTypes.has("cta")) warnings.push("No call-to-action section found.");
  if (!blueprint.seo.title) warnings.push("Missing SEO title.");
  if (!blueprint.seo.description) warnings.push("Missing SEO description.");

  return { passed: errors.length === 0, warnings, errors };
}
