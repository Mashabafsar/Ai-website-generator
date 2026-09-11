import type { TemplateModuleMeta } from "../contracts";
import { levynablushDemoBlueprint } from "./demo";
import { levynablushMotion } from "./motion";
import { levynablushSlots } from "./slots";
import { levynablushAssets } from "./assets";

export const levynablushMeta: TemplateModuleMeta = {
  slug: "levynablush",
  renderer: "levynablush",
  motion: levynablushMotion,
  slots: levynablushSlots,
  demo: {
    buildBlueprint: levynablushDemoBlueprint,
    contact: { email: "hello@levynablush.example", phone: "(555) 010-2040" },
  },
  assets: levynablushAssets,
};
