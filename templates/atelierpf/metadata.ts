import type { TemplateModuleMeta } from "../contracts";
import { atelierpfDemoBlueprint } from "./demo";
import { atelierpfMotion } from "./motion";
import { atelierpfSlots } from "./slots";
import { atelierpfAssets } from "./assets";

export const atelierpfMeta: TemplateModuleMeta = {
  slug: "atelierpf",
  renderer: "atelierpf",
  motion: atelierpfMotion,
  slots: atelierpfSlots,
  demo: {
    buildBlueprint: atelierpfDemoBlueprint,
    contact: { email: "hello@atelierpf.example", phone: "(555) 010-2040" },
  },
  assets: atelierpfAssets,
};
