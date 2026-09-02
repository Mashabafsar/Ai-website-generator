import type { TemplateModuleMeta } from "../contracts";
// Relative imports keep this metadata chain runnable from the standalone
// `templates:validate` script (which has no @/ path resolution).
import { sportsDemoBlueprint } from "./demo";
import { sportsMotion } from "./motion";
import { sportsSlots } from "./slots";
import { sportsAssets } from "./assets";

export const sportsMeta: TemplateModuleMeta = {
  slug: "sports",
  renderer: "sports",
  motion: sportsMotion,
  slots: sportsSlots,
  demo: {
    buildBlueprint: sportsDemoBlueprint,
    contact: { email: "hello@athlo.example", phone: "(555) 084-9300" },
  },
  assets: sportsAssets,
};
