import type { TemplateModuleMeta } from "../contracts";
// Relative imports keep this metadata chain runnable from the standalone
// `templates:validate` script (which has no @/ path resolution).
import { forgetechDemoBlueprint } from "./demo";
import { forgetechMotion } from "./motion";
import { forgetechSlots } from "./slots";
import { forgetechAssets } from "./assets";

export const forgetechMeta: TemplateModuleMeta = {
  slug: "forgetech",
  renderer: "forgetech",
  motion: forgetechMotion,
  slots: forgetechSlots,
  demo: {
    buildBlueprint: forgetechDemoBlueprint,
    contact: { email: "hello@forgetech.example", phone: "(555) 214-8890" },
  },
  assets: forgetechAssets,
};
