// Server-only map of renderer -> static HTML renderer. Imported by the export
// pipeline (ZIP / GitHub / deploy). Motion is injected centrally via
// `withMotion`, so individual template exporters never wire it themselves.

import type { AssembledSite } from "@/lib/blueprint/types";
import type { TemplateHtmlRenderer } from "./contracts";
import { withMotion } from "./shared/motion/runtime";
import { getModuleForSite } from "./registry";

import { renderForgeTechPage } from "./forgetech/export";
import { renderTechvantagePage } from "./techvantage/export";
import { renderCraftedSpacesPage } from "./craftedspaces/export";

const RENDERERS: Record<string, TemplateHtmlRenderer> = {
  forgetech: renderForgeTechPage,
  techvantage: renderTechvantagePage,
  craftedspaces: renderCraftedSpacesPage,
};

function rendererKey(site: AssembledSite): string | null {
  if (site.renderer && RENDERERS[site.renderer]) return site.renderer;
  if (site.templateSlug && RENDERERS[site.templateSlug]) return site.templateSlug;
  return null;
}

/** True when the site should export through a bespoke HTML renderer. */
export function hasBespokeExport(site: AssembledSite): boolean {
  return rendererKey(site) !== null;
}

/**
 * Renders a bespoke design to a complete static HTML document with the shared
 * motion runtime injected. Returns null for the generic section path.
 */
export function renderBespokeSite(site: AssembledSite): string | null {
  const key = rendererKey(site);
  if (!key) return null;
  return withMotion(RENDERERS[key](site));
}

/** Public-relative asset paths the design ships with. */
export function bespokeAssetPaths(site: AssembledSite): string[] {
  return getModuleForSite(site)?.assets ?? [];
}
