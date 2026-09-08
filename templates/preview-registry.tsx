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

import { forgetechMotion } from "./forgetech/motion";
import { techvantageMotion } from "./techvantage/motion";
import { craftedspacesMotion } from "./craftedspaces/motion";
import { whiterMotion } from "./whiter/motion";
import { mainfileMotion } from "./mainfile/motion";
import { saasldgMotion } from "./saasldg/motion";
import { sportsMotion } from "./sports/motion";
import { forgelimeMotion } from "./forgelime/motion";

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
