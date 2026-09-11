import type { TemplateModuleMeta } from "../contracts";
import { luxeframeDemoBlueprint } from "./demo";
import { luxeframeMotion } from "./motion";
import { luxeframeSlots } from "./slots";
import { luxeframeAssets } from "./assets";

export const luxeframeMeta: TemplateModuleMeta = {
  slug: "luxeframe",
  renderer: "luxeframe",
  motion: luxeframeMotion,
  slots: luxeframeSlots,
  demo: {
    buildBlueprint: luxeframeDemoBlueprint,
    contact: { email: "hello@luxeframe.example", phone: "(555) 010-2040" },
  },
  assets: luxeframeAssets,
};
