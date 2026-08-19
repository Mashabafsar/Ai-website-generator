// Central, boundary-safe registry of bespoke template modules. This is the one
// place a new design is registered for motion, slots, demo content, and assets.
// Rendering (React) and export (HTML) are resolved from the sibling registries,
// keyed by the `renderer` value declared here.

import type { TemplateModuleMeta } from "./contracts";
// Relative imports keep the metadata registry runnable from the standalone
// `templates:validate` script (which has no @/ path resolution).
import { forgetechMeta } from "./forgetech/metadata";
import { techvantageMeta } from "./techvantage/metadata";
import { craftedspacesMeta } from "./craftedspaces/metadata";

/** Every bespoke design. Add a new module's metadata here to register it. */
export const TEMPLATE_MODULES: TemplateModuleMeta[] = [
  forgetechMeta,
  techvantageMeta,
  craftedspacesMeta,
];

const BY_RENDERER = new Map(TEMPLATE_MODULES.map((m) => [m.renderer, m]));
const BY_SLUG = new Map(TEMPLATE_MODULES.map((m) => [m.slug, m]));

/** Resolve a bespoke module by its renderer or slug (they match by convention). */
export function getTemplateModule(key: string | null | undefined): TemplateModuleMeta | null {
  if (!key) return null;
  return BY_RENDERER.get(key) ?? BY_SLUG.get(key) ?? null;
}

/**
 * Resolve the bespoke module for an assembled site, tolerating older records
 * where only one of `renderer` / `templateSlug` was stored.
 */
export function getModuleForSite(site: {
  renderer?: string;
  templateSlug?: string;
}): TemplateModuleMeta | null {
  return getTemplateModule(site.renderer) ?? getTemplateModule(site.templateSlug);
}

/** Slugs that have a live demo behind them (all bespoke modules do). */
export function templateSlugsWithDemo(): string[] {
  return TEMPLATE_MODULES.map((m) => m.slug);
}

export function getTemplateDemo(slug: string) {
  return getTemplateModule(slug)?.demo ?? null;
}

/** Public-relative asset paths a design ships with, for export bundling. */
export function templateAssetsForSite(site: {
  renderer?: string;
  templateSlug?: string;
}): string[] {
  return getModuleForSite(site)?.assets ?? [];
}
