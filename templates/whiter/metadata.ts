import type { TemplateModuleMeta } from "../contracts";
// Relative imports keep this metadata chain runnable from the standalone
// `templates:validate` script (which has no @/ path resolution).
import { whiterDemoBlueprint } from "./demo";
import { whiterMotion } from "./motion";
import { whiterSlots } from "./slots";
import { whiterAssets } from "./assets";

export const whiterMeta: TemplateModuleMeta = {
  slug: "whiter",
  renderer: "whiter",
  motion: whiterMotion,
  slots: whiterSlots,
  demo: {
    buildBlueprint: whiterDemoBlueprint,
    contact: { email: "hello@nimbus.example", phone: "(555) 902-4471" },
  },
  assets: whiterAssets,
};
