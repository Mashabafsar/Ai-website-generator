import type { TemplateModuleMeta } from "../contracts";
import { ricardoDemoBlueprint } from "./demo";
import { ricardoMotion } from "./motion";
import { ricardoSlots } from "./slots";
import { ricardoAssets } from "./assets";

export const ricardoMeta: TemplateModuleMeta = {
  slug: "ricardo",
  renderer: "ricardo",
  motion: ricardoMotion,
  slots: ricardoSlots,
  demo: {
    buildBlueprint: ricardoDemoBlueprint,
    contact: { email: "hello@ricardo.example", phone: "(555) 010-2040" },
  },
  assets: ricardoAssets,
};
