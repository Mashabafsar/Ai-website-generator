import type { TemplateModuleMeta } from "../contracts";
import { foksDemoBlueprint } from "./demo";
import { foksMotion } from "./motion";
import { foksSlots } from "./slots";
import { foksAssets } from "./assets";

export const foksMeta: TemplateModuleMeta = {
  slug: "foks",
  renderer: "foks",
  motion: foksMotion,
  slots: foksSlots,
  demo: {
    buildBlueprint: foksDemoBlueprint,
    contact: { email: "hello@foks.example", phone: "(555) 010-2040" },
  },
  assets: foksAssets,
};
