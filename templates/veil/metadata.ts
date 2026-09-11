import type { TemplateModuleMeta } from "../contracts";
import { veilDemoBlueprint } from "./demo";
import { veilMotion } from "./motion";
import { veilSlots } from "./slots";
import { veilAssets } from "./assets";

export const veilMeta: TemplateModuleMeta = {
  slug: "veil",
  renderer: "veil",
  motion: veilMotion,
  slots: veilSlots,
  demo: {
    buildBlueprint: veilDemoBlueprint,
    contact: { email: "hello@veil.example", phone: "(555) 010-2040" },
  },
  assets: veilAssets,
};
