import type { TemplateModuleMeta } from "../contracts";
import { willjacksDemoBlueprint } from "./demo";
import { willjacksMotion } from "./motion";
import { willjacksSlots } from "./slots";
import { willjacksAssets } from "./assets";

export const willjacksMeta: TemplateModuleMeta = {
  slug: "willjacks",
  renderer: "willjacks",
  motion: willjacksMotion,
  slots: willjacksSlots,
  demo: {
    buildBlueprint: willjacksDemoBlueprint,
    contact: { email: "hello@willjacks.example", phone: "(555) 010-2040" },
  },
  assets: willjacksAssets,
};
