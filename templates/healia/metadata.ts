import type { TemplateModuleMeta } from "../contracts";
import { healiaDemoBlueprint } from "./demo";
import { healiaMotion } from "./motion";
import { healiaSlots } from "./slots";
import { healiaAssets } from "./assets";

export const healiaMeta: TemplateModuleMeta = {
  slug: "healia",
  renderer: "healia",
  motion: healiaMotion,
  slots: healiaSlots,
  demo: {
    buildBlueprint: healiaDemoBlueprint,
    contact: { email: "hello@healia.example", phone: "(555) 010-2040" },
  },
  assets: healiaAssets,
};
