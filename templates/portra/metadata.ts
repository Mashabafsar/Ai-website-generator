import type { TemplateModuleMeta } from "../contracts";
import { portraDemoBlueprint } from "./demo";
import { portraMotion } from "./motion";
import { portraSlots } from "./slots";
import { portraAssets } from "./assets";

export const portraMeta: TemplateModuleMeta = {
  slug: "portra",
  renderer: "portra",
  motion: portraMotion,
  slots: portraSlots,
  demo: {
    buildBlueprint: portraDemoBlueprint,
    contact: { email: "hello@portra.example", phone: "(555) 010-2040" },
  },
  assets: portraAssets,
};
