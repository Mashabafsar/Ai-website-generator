import type { TemplateModuleMeta } from "../contracts";
import { levynagoldDemoBlueprint } from "./demo";
import { levynagoldMotion } from "./motion";
import { levynagoldSlots } from "./slots";
import { levynagoldAssets } from "./assets";

export const levynagoldMeta: TemplateModuleMeta = {
  slug: "levynagold",
  renderer: "levynagold",
  motion: levynagoldMotion,
  slots: levynagoldSlots,
  demo: {
    buildBlueprint: levynagoldDemoBlueprint,
    contact: { email: "hello@levynagold.example", phone: "(555) 010-2040" },
  },
  assets: levynagoldAssets,
};
