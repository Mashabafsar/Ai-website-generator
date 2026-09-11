import type { TemplateModuleMeta } from "../contracts";
import { elektraDemoBlueprint } from "./demo";
import { elektraMotion } from "./motion";
import { elektraSlots } from "./slots";
import { elektraAssets } from "./assets";

export const elektraMeta: TemplateModuleMeta = {
  slug: "elektra",
  renderer: "elektra",
  motion: elektraMotion,
  slots: elektraSlots,
  demo: {
    buildBlueprint: elektraDemoBlueprint,
    contact: { email: "hello@elektra.example", phone: "(555) 010-2040" },
  },
  assets: elektraAssets,
};
