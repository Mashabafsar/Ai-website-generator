import type { TemplateModuleMeta } from "../contracts";
import { kaelDemoBlueprint } from "./demo";
import { kaelMotion } from "./motion";
import { kaelSlots } from "./slots";
import { kaelAssets } from "./assets";

export const kaelMeta: TemplateModuleMeta = {
  slug: "kael",
  renderer: "kael",
  motion: kaelMotion,
  slots: kaelSlots,
  demo: {
    buildBlueprint: kaelDemoBlueprint,
    contact: { email: "hello@kael.example", phone: "(555) 010-2040" },
  },
  assets: kaelAssets,
};
