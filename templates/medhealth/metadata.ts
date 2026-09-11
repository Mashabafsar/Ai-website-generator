import type { TemplateModuleMeta } from "../contracts";
import { medhealthDemoBlueprint } from "./demo";
import { medhealthMotion } from "./motion";
import { medhealthSlots } from "./slots";
import { medhealthAssets } from "./assets";

export const medhealthMeta: TemplateModuleMeta = {
  slug: "medhealth",
  renderer: "medhealth",
  motion: medhealthMotion,
  slots: medhealthSlots,
  demo: {
    buildBlueprint: medhealthDemoBlueprint,
    contact: { email: "hello@medhealth.example", phone: "(555) 010-2040" },
  },
  assets: medhealthAssets,
};
