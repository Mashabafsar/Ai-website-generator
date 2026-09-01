import type { TemplateModuleMeta } from "../contracts";
// Relative imports keep this metadata chain runnable from the standalone
// `templates:validate` script (which has no @/ path resolution).
import { saasldgDemoBlueprint } from "./demo";
import { saasldgMotion } from "./motion";
import { saasldgSlots } from "./slots";
import { saasldgAssets } from "./assets";

export const saasldgMeta: TemplateModuleMeta = {
  slug: "saasldg",
  renderer: "saasldg",
  motion: saasldgMotion,
  slots: saasldgSlots,
  demo: {
    buildBlueprint: saasldgDemoBlueprint,
    contact: { email: "hello@flowbase.example", phone: "(555) 018-2245" },
  },
  assets: saasldgAssets,
};
