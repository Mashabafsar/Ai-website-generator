import type { TemplateModuleMeta } from "../contracts";
import { levynaDemoBlueprint } from "./demo";
import { levynaMotion } from "./motion";
import { levynaSlots } from "./slots";
import { levynaAssets } from "./assets";

export const levynaMeta: TemplateModuleMeta = {
  slug: "levyna",
  renderer: "levyna",
  motion: levynaMotion,
  slots: levynaSlots,
  demo: {
    buildBlueprint: levynaDemoBlueprint,
    contact: { email: "hello@levyna.example", phone: "(555) 010-2040" },
  },
  assets: levynaAssets,
};
