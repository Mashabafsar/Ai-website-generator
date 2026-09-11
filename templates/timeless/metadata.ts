import type { TemplateModuleMeta } from "../contracts";
import { timelessDemoBlueprint } from "./demo";
import { timelessMotion } from "./motion";
import { timelessSlots } from "./slots";
import { timelessAssets } from "./assets";

export const timelessMeta: TemplateModuleMeta = {
  slug: "timeless",
  renderer: "timeless",
  motion: timelessMotion,
  slots: timelessSlots,
  demo: {
    buildBlueprint: timelessDemoBlueprint,
    contact: { email: "hello@timeless.example", phone: "(555) 010-2040" },
  },
  assets: timelessAssets,
};
