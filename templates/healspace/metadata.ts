import type { TemplateModuleMeta } from "../contracts";
import { healspaceDemoBlueprint } from "./demo";
import { healspaceMotion } from "./motion";
import { healspaceSlots } from "./slots";
import { healspaceAssets } from "./assets";

export const healspaceMeta: TemplateModuleMeta = {
  slug: "healspace",
  renderer: "healspace",
  motion: healspaceMotion,
  slots: healspaceSlots,
  demo: {
    buildBlueprint: healspaceDemoBlueprint,
    contact: { email: "hello@healspace.example", phone: "(555) 010-2040" },
  },
  assets: healspaceAssets,
};
