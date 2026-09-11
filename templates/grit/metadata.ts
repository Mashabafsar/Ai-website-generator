import type { TemplateModuleMeta } from "../contracts";
import { gritDemoBlueprint } from "./demo";
import { gritMotion } from "./motion";
import { gritSlots } from "./slots";
import { gritAssets } from "./assets";

export const gritMeta: TemplateModuleMeta = {
  slug: "grit",
  renderer: "grit",
  motion: gritMotion,
  slots: gritSlots,
  demo: {
    buildBlueprint: gritDemoBlueprint,
    contact: { email: "hello@grit.example", phone: "(555) 010-2040" },
  },
  assets: gritAssets,
};
