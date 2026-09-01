import type { TemplateModuleMeta } from "../contracts";
// Relative imports keep this metadata chain runnable from the standalone
// `templates:validate` script (which has no @/ path resolution).
import { mainfileDemoBlueprint } from "./demo";
import { mainfileMotion } from "./motion";
import { mainfileSlots } from "./slots";
import { mainfileAssets } from "./assets";

export const mainfileMeta: TemplateModuleMeta = {
  slug: "mainfile",
  renderer: "mainfile",
  motion: mainfileMotion,
  slots: mainfileSlots,
  demo: {
    buildBlueprint: mainfileDemoBlueprint,
    contact: { email: "hello@mraval.example", phone: "+369 258 147 258" },
  },
  assets: mainfileAssets,
};
