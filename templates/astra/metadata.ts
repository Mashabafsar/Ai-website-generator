import type { TemplateModuleMeta } from "../contracts";
import { astraDemoBlueprint } from "./demo";
import { astraMotion } from "./motion";
import { astraSlots } from "./slots";
import { astraAssets } from "./assets";

export const astraMeta: TemplateModuleMeta = {
  slug: "astra",
  renderer: "astra",
  motion: astraMotion,
  slots: astraSlots,
  demo: {
    buildBlueprint: astraDemoBlueprint,
    contact: { email: "hello@astra.example", phone: "(555) 010-2040" },
  },
  assets: astraAssets,
};
