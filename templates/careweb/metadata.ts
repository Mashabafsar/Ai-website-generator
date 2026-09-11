import type { TemplateModuleMeta } from "../contracts";
import { carewebDemoBlueprint } from "./demo";
import { carewebMotion } from "./motion";
import { carewebSlots } from "./slots";
import { carewebAssets } from "./assets";

export const carewebMeta: TemplateModuleMeta = {
  slug: "careweb",
  renderer: "careweb",
  motion: carewebMotion,
  slots: carewebSlots,
  demo: {
    buildBlueprint: carewebDemoBlueprint,
    contact: { email: "hello@careweb.example", phone: "(555) 010-2040" },
  },
  assets: carewebAssets,
};
