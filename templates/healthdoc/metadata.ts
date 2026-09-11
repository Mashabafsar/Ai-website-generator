import type { TemplateModuleMeta } from "../contracts";
import { healthdocDemoBlueprint } from "./demo";
import { healthdocMotion } from "./motion";
import { healthdocSlots } from "./slots";
import { healthdocAssets } from "./assets";

export const healthdocMeta: TemplateModuleMeta = {
  slug: "healthdoc",
  renderer: "healthdoc",
  motion: healthdocMotion,
  slots: healthdocSlots,
  demo: {
    buildBlueprint: healthdocDemoBlueprint,
    contact: { email: "hello@healthdoc.example", phone: "(555) 010-2040" },
  },
  assets: healthdocAssets,
};
