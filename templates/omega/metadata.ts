import type { TemplateModuleMeta } from "../contracts";
import { omegaDemoBlueprint } from "./demo";
import { omegaMotion } from "./motion";
import { omegaSlots } from "./slots";
import { omegaAssets } from "./assets";

export const omegaMeta: TemplateModuleMeta = {
  slug: "omega",
  renderer: "omega",
  motion: omegaMotion,
  slots: omegaSlots,
  demo: {
    buildBlueprint: omegaDemoBlueprint,
    contact: { email: "hello@omega.example", phone: "(555) 010-2040" },
  },
  assets: omegaAssets,
};
