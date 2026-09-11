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
import { whiterMeta } from "./whiter/metadata";
import { mainfileMeta } from "./mainfile/metadata";
import { saasldgMeta } from "./saasldg/metadata";
import { sportsMeta } from "./sports/metadata";
import { forgelimeMeta } from "./forgelime/metadata";
import { astraMeta } from "./astra/metadata";
import { azurioMeta } from "./azurio/metadata";
import { oliviaMeta } from "./olivia/metadata";
import { elektraMeta } from "./elektra/metadata";
import { flowmintMeta } from "./flowmint/metadata";
import { foksMeta } from "./foks/metadata";
import { fusionMeta } from "./fusion/metadata";
import { healiaMeta } from "./healia/metadata";
import { healspaceMeta } from "./healspace/metadata";
import { healthdocMeta } from "./healthdoc/metadata";
import { clinicallyMeta } from "./clinically/metadata";
import { medhealthMeta } from "./medhealth/metadata";
import { carewebMeta } from "./careweb/metadata";
import { kaelMeta } from "./kael/metadata";
import { lukaszMeta } from "./lukasz/metadata";
import { luxeframeMeta } from "./luxeframe/metadata";
import { gritMeta } from "./grit/metadata";
import { omegaMeta } from "./omega/metadata";
import { onixMeta } from "./onix/metadata";
import { portraMeta } from "./portra/metadata";
import { rebelMeta } from "./rebel/metadata";
import { ricardoMeta } from "./ricardo/metadata";
import { timelessMeta } from "./timeless/metadata";
import { levynaMeta } from "./levyna/metadata";
import { levynablushMeta } from "./levynablush/metadata";
import { levynagoldMeta } from "./levynagold/metadata";
import { veilMeta } from "./veil/metadata";
import { webcanvasMeta } from "./webcanvas/metadata";
import { willjacksMeta } from "./willjacks/metadata";
import { teaserMeta } from "./teaser/metadata";
import { atelierpfMeta } from "./atelierpf/metadata";
import { resumeMeta } from "./resume/metadata";
import { reboMeta } from "./rebo/metadata";

/** Every bespoke design. Add a new module's metadata here to register it. */
export const TEMPLATE_MODULES: TemplateModuleMeta[] = [
  forgetechMeta,
  techvantageMeta,
  craftedspacesMeta,
  whiterMeta,
  mainfileMeta,
  saasldgMeta,
  sportsMeta,
  forgelimeMeta,
  astraMeta,
  azurioMeta,
  oliviaMeta,
  elektraMeta,
  flowmintMeta,
  foksMeta,
  fusionMeta,
  healiaMeta,
  healspaceMeta,
  healthdocMeta,
  clinicallyMeta,
  medhealthMeta,
  carewebMeta,
  kaelMeta,
  lukaszMeta,
  luxeframeMeta,
  gritMeta,
  omegaMeta,
  onixMeta,
  portraMeta,
  rebelMeta,
  ricardoMeta,
  timelessMeta,
  levynaMeta,
  levynablushMeta,
  levynagoldMeta,
  veilMeta,
  webcanvasMeta,
  willjacksMeta,
  teaserMeta,
  atelierpfMeta,
  resumeMeta,
  reboMeta,
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
