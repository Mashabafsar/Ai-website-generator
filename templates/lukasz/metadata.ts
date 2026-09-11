import type { TemplateModuleMeta } from "../contracts";
import { lukaszDemoBlueprint } from "./demo";
import { lukaszMotion } from "./motion";
import { lukaszSlots } from "./slots";
import { lukaszAssets } from "./assets";

export const lukaszMeta: TemplateModuleMeta = {
  slug: "lukasz",
  renderer: "lukasz",
  motion: lukaszMotion,
  slots: lukaszSlots,
  demo: {
    buildBlueprint: lukaszDemoBlueprint,
    contact: { email: "hello@lukasz.example", phone: "(555) 010-2040" },
  },
  assets: lukaszAssets,
};
