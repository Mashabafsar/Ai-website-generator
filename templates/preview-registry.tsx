// Client-safe map of renderer -> React renderer, each wrapped in the shared
// motion runtime. Imported by the editor / live preview / public demo. Contains
// no Node-only export code.

import type { AssembledSite, WebsiteBlueprint, SiteContact } from "@/lib/blueprint/types";
import { TemplateMotionRoot } from "./shared/motion/root";
import type { MotionProfile } from "./shared/motion/profile";
import type { TemplatePreview } from "./contracts";
import { getTemplateModule } from "./registry";

import { ForgeTechSite } from "./forgetech/site";
import { TechvantageSite } from "./techvantage/site";
import { CraftedSpacesSite } from "./craftedspaces/site";
import { WhiterSite } from "./whiter/site";
import { MainfileSite } from "./mainfile/site";
import { SaasLandingSite } from "./saasldg/site";
import { SportsSite } from "./sports/site";
import { ForgeLimeSite } from "./forgelime/site";
import { AstraSite } from "./astra/site";
import { AzurioSite } from "./azurio/site";
import { OliviaSite } from "./olivia/site";
import { ElektraSite } from "./elektra/site";
import { FlowmintSite } from "./flowmint/site";
import { FoksSite } from "./foks/site";
import { FusionSite } from "./fusion/site";
import { HealiaSite } from "./healia/site";
import { HealspaceSite } from "./healspace/site";
import { HealthdocSite } from "./healthdoc/site";
import { ClinicallySite } from "./clinically/site";
import { MedhealthSite } from "./medhealth/site";
import { CarewebSite } from "./careweb/site";
import { KaelSite } from "./kael/site";
import { LukaszSite } from "./lukasz/site";
import { LuxeframeSite } from "./luxeframe/site";
import { GritSite } from "./grit/site";
import { OmegaSite } from "./omega/site";
import { OnixSite } from "./onix/site";
import { PortraSite } from "./portra/site";
import { RebelSite } from "./rebel/site";
import { RicardoSite } from "./ricardo/site";
import { TimelessSite } from "./timeless/site";
import { LevynaSite } from "./levyna/site";
import { LevynablushSite } from "./levynablush/site";
import { LevynagoldSite } from "./levynagold/site";
import { VeilSite } from "./veil/site";
import { WebcanvasSite } from "./webcanvas/site";
import { WilljacksSite } from "./willjacks/site";
import { TeaserSite } from "./teaser/site";
import { AtelierpfSite } from "./atelierpf/site";
import { ResumeSite } from "./resume/site";
import { ReboSite } from "./rebo/site";

import { forgetechMotion } from "./forgetech/motion";
import { techvantageMotion } from "./techvantage/motion";
import { craftedspacesMotion } from "./craftedspaces/motion";
import { whiterMotion } from "./whiter/motion";
import { mainfileMotion } from "./mainfile/motion";
import { saasldgMotion } from "./saasldg/motion";
import { sportsMotion } from "./sports/motion";
import { forgelimeMotion } from "./forgelime/motion";
import { astraMotion } from "./astra/motion";
import { azurioMotion } from "./azurio/motion";
import { oliviaMotion } from "./olivia/motion";
import { elektraMotion } from "./elektra/motion";
import { flowmintMotion } from "./flowmint/motion";
import { foksMotion } from "./foks/motion";
import { fusionMotion } from "./fusion/motion";
import { healiaMotion } from "./healia/motion";
import { healspaceMotion } from "./healspace/motion";
import { healthdocMotion } from "./healthdoc/motion";
import { clinicallyMotion } from "./clinically/motion";
import { medhealthMotion } from "./medhealth/motion";
import { carewebMotion } from "./careweb/motion";
import { kaelMotion } from "./kael/motion";
import { lukaszMotion } from "./lukasz/motion";
import { luxeframeMotion } from "./luxeframe/motion";
import { gritMotion } from "./grit/motion";
import { omegaMotion } from "./omega/motion";
import { onixMotion } from "./onix/motion";
import { portraMotion } from "./portra/motion";
import { rebelMotion } from "./rebel/motion";
import { ricardoMotion } from "./ricardo/motion";
import { timelessMotion } from "./timeless/motion";
import { levynaMotion } from "./levyna/motion";
import { levynablushMotion } from "./levynablush/motion";
import { levynagoldMotion } from "./levynagold/motion";
import { veilMotion } from "./veil/motion";
import { webcanvasMotion } from "./webcanvas/motion";
import { willjacksMotion } from "./willjacks/motion";
import { teaserMotion } from "./teaser/motion";
import { atelierpfMotion } from "./atelierpf/motion";
import { resumeMotion } from "./resume/motion";
import { reboMotion } from "./rebo/motion";

type PreviewEntry = { Component: TemplatePreview; motion: MotionProfile };

const PREVIEWS: Record<string, PreviewEntry> = {
  forgetech: { Component: ForgeTechSite, motion: forgetechMotion },
  techvantage: { Component: TechvantageSite, motion: techvantageMotion },
  craftedspaces: { Component: CraftedSpacesSite, motion: craftedspacesMotion },
  whiter: { Component: WhiterSite, motion: whiterMotion },
  mainfile: { Component: MainfileSite, motion: mainfileMotion },
  saasldg: { Component: SaasLandingSite, motion: saasldgMotion },
  sports: { Component: SportsSite, motion: sportsMotion },
  forgelime: { Component: ForgeLimeSite, motion: forgelimeMotion },
  astra: { Component: AstraSite, motion: astraMotion },
  azurio: { Component: AzurioSite, motion: azurioMotion },
  olivia: { Component: OliviaSite, motion: oliviaMotion },
  elektra: { Component: ElektraSite, motion: elektraMotion },
  flowmint: { Component: FlowmintSite, motion: flowmintMotion },
  foks: { Component: FoksSite, motion: foksMotion },
  fusion: { Component: FusionSite, motion: fusionMotion },
  healia: { Component: HealiaSite, motion: healiaMotion },
  healspace: { Component: HealspaceSite, motion: healspaceMotion },
  healthdoc: { Component: HealthdocSite, motion: healthdocMotion },
  clinically: { Component: ClinicallySite, motion: clinicallyMotion },
  medhealth: { Component: MedhealthSite, motion: medhealthMotion },
  careweb: { Component: CarewebSite, motion: carewebMotion },
  kael: { Component: KaelSite, motion: kaelMotion },
  lukasz: { Component: LukaszSite, motion: lukaszMotion },
  luxeframe: { Component: LuxeframeSite, motion: luxeframeMotion },
  grit: { Component: GritSite, motion: gritMotion },
  omega: { Component: OmegaSite, motion: omegaMotion },
  onix: { Component: OnixSite, motion: onixMotion },
  portra: { Component: PortraSite, motion: portraMotion },
  rebel: { Component: RebelSite, motion: rebelMotion },
  ricardo: { Component: RicardoSite, motion: ricardoMotion },
  timeless: { Component: TimelessSite, motion: timelessMotion },
  levyna: { Component: LevynaSite, motion: levynaMotion },
  levynablush: { Component: LevynablushSite, motion: levynablushMotion },
  levynagold: { Component: LevynagoldSite, motion: levynagoldMotion },
  veil: { Component: VeilSite, motion: veilMotion },
  webcanvas: { Component: WebcanvasSite, motion: webcanvasMotion },
  willjacks: { Component: WilljacksSite, motion: willjacksMotion },
  teaser: { Component: TeaserSite, motion: teaserMotion },
  atelierpf: { Component: AtelierpfSite, motion: atelierpfMotion },
  resume: { Component: ResumeSite, motion: resumeMotion },
  rebo: { Component: ReboSite, motion: reboMotion },
};

/** True when a design has a dedicated bespoke React renderer. */
export function hasBespokePreview(key: string | null | undefined): boolean {
  return Boolean(key && PREVIEWS[key]);
}

/**
 * Renders a bespoke design (by renderer or slug) wrapped in the shared motion
 * runtime. Returns null for the generic `standard-sections` path so the caller
 * can fall back to the section registry.
 */
export function BespokePreview({
  site,
  blueprint,
  contact,
  pageSlug,
}: {
  site?: AssembledSite | null;
  blueprint?: WebsiteBlueprint | null;
  contact?: SiteContact | null;
  pageSlug?: string;
}) {
  const key =
    (site?.renderer && PREVIEWS[site.renderer] && site.renderer) ||
    (site?.templateSlug && PREVIEWS[site.templateSlug] && site.templateSlug) ||
    null;

  if (!key) return null;

  const entry = PREVIEWS[key];
  const motion = getTemplateModule(key)?.motion ?? entry.motion;
  const { Component } = entry;

  return (
    <TemplateMotionRoot profile={motion}>
      <Component site={site} blueprint={blueprint} contact={contact} pageSlug={pageSlug} />
    </TemplateMotionRoot>
  );
}
