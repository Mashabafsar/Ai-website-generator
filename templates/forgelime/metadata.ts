import type { TemplateModuleMeta } from "../contracts";
import { forgelimeDemoBlueprint } from "./demo";
import { forgelimeMotion } from "./motion";
import { forgelimeSlots } from "./slots";
import { forgelimeAssets } from "./assets";

export const forgelimeMeta: TemplateModuleMeta = {
  slug: "forgelime",
  renderer: "forgelime",
  motion: forgelimeMotion,
  slots: forgelimeSlots,
  demo: {
    buildBlueprint: forgelimeDemoBlueprint,
    contact: { email: "hello@forgelime.example", phone: "(555) 016-7740" },
  },
  assets: forgelimeAssets,
};
