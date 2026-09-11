import type { TemplateModuleMeta } from "../contracts";
import { rebelDemoBlueprint } from "./demo";
import { rebelMotion } from "./motion";
import { rebelSlots } from "./slots";
import { rebelAssets } from "./assets";

export const rebelMeta: TemplateModuleMeta = {
  slug: "rebel",
  renderer: "rebel",
  motion: rebelMotion,
  slots: rebelSlots,
  demo: {
    buildBlueprint: rebelDemoBlueprint,
    contact: { email: "hello@rebel.example", phone: "(555) 010-2040" },
  },
  assets: rebelAssets,
};
