import type { WebsiteBlueprint } from "@/lib/blueprint/types";
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
export function runQa(blueprint: WebsiteBlueprint): QaReport {
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

  if (!allTypes.has("contact")) warnings.push("No contact section found.");
  if (!allTypes.has("cta")) warnings.push("No call-to-action section found.");
  if (!blueprint.seo.title) warnings.push("Missing SEO title.");
  if (!blueprint.seo.description) warnings.push("Missing SEO description.");

  return { passed: errors.length === 0, warnings, errors };
}
