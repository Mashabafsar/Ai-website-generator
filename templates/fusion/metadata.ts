import type { TemplateModuleMeta } from "../contracts";
import { fusionDemoBlueprint } from "./demo";
import { fusionMotion } from "./motion";
import { fusionSlots } from "./slots";
import { fusionAssets } from "./assets";

export const fusionMeta: TemplateModuleMeta = {
  slug: "fusion",
  renderer: "fusion",
  motion: fusionMotion,
  slots: fusionSlots,
  demo: {
    buildBlueprint: fusionDemoBlueprint,
    contact: { email: "hello@fusion.example", phone: "(555) 010-2040" },
  },
  assets: fusionAssets,
};
