import type { TemplateModuleMeta } from "../contracts";
import { azurioDemoBlueprint } from "./demo";
import { azurioMotion } from "./motion";
import { azurioSlots } from "./slots";
import { azurioAssets } from "./assets";

export const azurioMeta: TemplateModuleMeta = {
  slug: "azurio",
  renderer: "azurio",
  motion: azurioMotion,
  slots: azurioSlots,
  demo: {
    buildBlueprint: azurioDemoBlueprint,
    contact: { email: "hello@azurio.example", phone: "(555) 010-2040" },
  },
  assets: azurioAssets,
};
