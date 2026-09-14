import type { TemplateModuleMeta } from "../contracts";
import { sarahfolioDemoBlueprint } from "./demo";
import { sarahfolioMotion } from "./motion";
import { sarahfolioSlots } from "./slots";
import { sarahfolioAssets } from "./assets";

export const sarahfolioMeta: TemplateModuleMeta = {
  slug: "sarahfolio",
  renderer: "sarahfolio",
  motion: sarahfolioMotion,
  slots: sarahfolioSlots,
  demo: {
    buildBlueprint: sarahfolioDemoBlueprint,
    contact: { email: "hello@sarahfolio.com", phone: "(555) 014-2200" },
  },
  assets: sarahfolioAssets,
};
