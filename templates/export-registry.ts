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
import { renderWhiterPage } from "./whiter/export";
import { renderMainfilePage } from "./mainfile/export";
import { renderSaasLandingPage } from "./saasldg/export";
import { renderSportsPage } from "./sports/export";
import { renderForgeLimePage } from "./forgelime/export";
import { renderAstraPage } from "./astra/export";
import { renderAzurioPage } from "./azurio/export";
import { renderOliviaPage } from "./olivia/export";
import { renderElektraPage } from "./elektra/export";
import { renderFlowmintPage } from "./flowmint/export";
import { renderFoksPage } from "./foks/export";
import { renderFusionPage } from "./fusion/export";
import { renderHealiaPage } from "./healia/export";
import { renderHealspacePage } from "./healspace/export";
import { renderHealthdocPage } from "./healthdoc/export";
import { renderClinicallyPage } from "./clinically/export";
import { renderMedhealthPage } from "./medhealth/export";
import { renderCarewebPage } from "./careweb/export";
import { renderKaelPage } from "./kael/export";
import { renderLukaszPage } from "./lukasz/export";
import { renderLuxeframePage } from "./luxeframe/export";
import { renderGritPage } from "./grit/export";
import { renderOmegaPage } from "./omega/export";
import { renderOnixPage } from "./onix/export";
import { renderPortraPage } from "./portra/export";
import { renderRebelPage } from "./rebel/export";
import { renderRicardoPage } from "./ricardo/export";
import { renderTimelessPage } from "./timeless/export";
import { renderLevynaPage } from "./levyna/export";
import { renderLevynablushPage } from "./levynablush/export";
import { renderLevynagoldPage } from "./levynagold/export";
import { renderVeilPage } from "./veil/export";
import { renderWebcanvasPage } from "./webcanvas/export";
import { renderWilljacksPage } from "./willjacks/export";
import { renderTeaserPage } from "./teaser/export";
import { renderAtelierpfPage } from "./atelierpf/export";
import { renderResumePage } from "./resume/export";
import { renderReboPage } from "./rebo/export";

const RENDERERS: Record<string, TemplateHtmlRenderer> = {
  forgetech: renderForgeTechPage,
  techvantage: renderTechvantagePage,
  craftedspaces: renderCraftedSpacesPage,
  whiter: renderWhiterPage,
  mainfile: renderMainfilePage,
  saasldg: renderSaasLandingPage,
  sports: renderSportsPage,
  forgelime: renderForgeLimePage,
  astra: renderAstraPage,
  azurio: renderAzurioPage,
  olivia: renderOliviaPage,
  elektra: renderElektraPage,
  flowmint: renderFlowmintPage,
  foks: renderFoksPage,
  fusion: renderFusionPage,
  healia: renderHealiaPage,
  healspace: renderHealspacePage,
  healthdoc: renderHealthdocPage,
  clinically: renderClinicallyPage,
  medhealth: renderMedhealthPage,
  careweb: renderCarewebPage,
  kael: renderKaelPage,
  lukasz: renderLukaszPage,
  luxeframe: renderLuxeframePage,
  grit: renderGritPage,
  omega: renderOmegaPage,
  onix: renderOnixPage,
  portra: renderPortraPage,
  rebel: renderRebelPage,
  ricardo: renderRicardoPage,
  timeless: renderTimelessPage,
  levyna: renderLevynaPage,
  levynablush: renderLevynablushPage,
  levynagold: renderLevynagoldPage,
  veil: renderVeilPage,
  webcanvas: renderWebcanvasPage,
  willjacks: renderWilljacksPage,
  teaser: renderTeaserPage,
  atelierpf: renderAtelierpfPage,
  resume: renderResumePage,
  rebo: renderReboPage,
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
 * Renders one page of a bespoke design to a complete static HTML document with
 * the shared motion runtime injected. `pageSlug` defaults to "home"; single-page
 * designs ignore it. Returns null for the generic section path.
 */
export function renderBespokeSite(site: AssembledSite, pageSlug?: string): string | null {
  const key = rendererKey(site);
  if (!key) return null;
  return withMotion(RENDERERS[key](site, pageSlug));
}

/** Public-relative asset paths the design ships with. */
export function bespokeAssetPaths(site: AssembledSite): string[] {
  return getModuleForSite(site)?.assets ?? [];
}
