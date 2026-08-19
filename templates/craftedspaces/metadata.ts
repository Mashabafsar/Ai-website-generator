import type { TemplateModuleMeta } from "../contracts";
// Relative imports keep this metadata chain runnable from the standalone
// `templates:validate` script (which has no @/ path resolution).
import { craftedspacesDemoBlueprint } from "./demo";
import { craftedspacesMotion } from "./motion";
import { craftedspacesSlots } from "./slots";
import { craftedspacesAssets } from "./assets";

export const craftedspacesMeta: TemplateModuleMeta = {
  slug: "craftedspaces",
  renderer: "craftedspaces",
  motion: craftedspacesMotion,
  slots: craftedspacesSlots,
  demo: {
    buildBlueprint: craftedspacesDemoBlueprint,
    contact: {
      email: "info@craftedspace.com",
      phone: "+1 (555) 123-4567",
      address: "456 Lone Star Parkway, Austin, TX 78701 United States",
    },
  },
  assets: craftedspacesAssets,
};
