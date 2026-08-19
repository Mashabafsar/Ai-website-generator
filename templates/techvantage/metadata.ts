import type { TemplateModuleMeta } from "../contracts";
// Relative imports keep this metadata chain runnable from the standalone
// `templates:validate` script (which has no @/ path resolution).
import { techvantageDemoBlueprint } from "./demo";
import { techvantageMotion } from "./motion";
import { techvantageSlots } from "./slots";
import { techvantageAssets } from "./assets";

export const techvantageMeta: TemplateModuleMeta = {
  slug: "techvantage",
  renderer: "techvantage",
  motion: techvantageMotion,
  slots: techvantageSlots,
  demo: {
    buildBlueprint: techvantageDemoBlueprint,
    contact: {
      email: "info@techvantage.example",
      phone: "(920) 006 9580",
      address: "456 Lone Star Parkway, Austin, TX 78701",
    },
  },
  assets: techvantageAssets,
};
