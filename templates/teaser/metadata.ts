import type { TemplateModuleMeta } from "../contracts";
import { teaserDemoBlueprint } from "./demo";
import { teaserMotion } from "./motion";
import { teaserSlots } from "./slots";
import { teaserAssets } from "./assets";

export const teaserMeta: TemplateModuleMeta = {
  slug: "teaser",
  renderer: "teaser",
  motion: teaserMotion,
  slots: teaserSlots,
  demo: {
    buildBlueprint: teaserDemoBlueprint,
    contact: { email: "hello@teaser.example", phone: "(555) 010-2040" },
  },
  assets: teaserAssets,
};
