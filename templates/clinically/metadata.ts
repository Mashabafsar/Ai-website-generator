import type { TemplateModuleMeta } from "../contracts";
import { clinicallyDemoBlueprint } from "./demo";
import { clinicallyMotion } from "./motion";
import { clinicallySlots } from "./slots";
import { clinicallyAssets } from "./assets";

export const clinicallyMeta: TemplateModuleMeta = {
  slug: "clinically",
  renderer: "clinically",
  motion: clinicallyMotion,
  slots: clinicallySlots,
  demo: {
    buildBlueprint: clinicallyDemoBlueprint,
    contact: { email: "hello@clinically.example", phone: "(555) 010-2040" },
  },
  assets: clinicallyAssets,
};
