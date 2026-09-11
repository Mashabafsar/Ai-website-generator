import type { TemplateModuleMeta } from "../contracts";
import { onixDemoBlueprint } from "./demo";
import { onixMotion } from "./motion";
import { onixSlots } from "./slots";
import { onixAssets } from "./assets";

export const onixMeta: TemplateModuleMeta = {
  slug: "onix",
  renderer: "onix",
  motion: onixMotion,
  slots: onixSlots,
  demo: {
    buildBlueprint: onixDemoBlueprint,
    contact: { email: "hello@onix.example", phone: "(555) 010-2040" },
  },
  assets: onixAssets,
};
