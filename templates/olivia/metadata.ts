import type { TemplateModuleMeta } from "../contracts";
import { oliviaDemoBlueprint } from "./demo";
import { oliviaMotion } from "./motion";
import { oliviaSlots } from "./slots";
import { oliviaAssets } from "./assets";

export const oliviaMeta: TemplateModuleMeta = {
  slug: "olivia",
  renderer: "olivia",
  motion: oliviaMotion,
  slots: oliviaSlots,
  demo: {
    buildBlueprint: oliviaDemoBlueprint,
    contact: { email: "hello@olivia.example", phone: "(555) 010-2040" },
  },
  assets: oliviaAssets,
};
