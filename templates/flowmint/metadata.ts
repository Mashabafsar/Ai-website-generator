import type { TemplateModuleMeta } from "../contracts";
import { flowmintDemoBlueprint } from "./demo";
import { flowmintMotion } from "./motion";
import { flowmintSlots } from "./slots";
import { flowmintAssets } from "./assets";

export const flowmintMeta: TemplateModuleMeta = {
  slug: "flowmint",
  renderer: "flowmint",
  motion: flowmintMotion,
  slots: flowmintSlots,
  demo: {
    buildBlueprint: flowmintDemoBlueprint,
    contact: { email: "hello@flowmint.example", phone: "(555) 010-2040" },
  },
  assets: flowmintAssets,
};
