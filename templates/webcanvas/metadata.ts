import type { TemplateModuleMeta } from "../contracts";
import { webcanvasDemoBlueprint } from "./demo";
import { webcanvasMotion } from "./motion";
import { webcanvasSlots } from "./slots";
import { webcanvasAssets } from "./assets";

export const webcanvasMeta: TemplateModuleMeta = {
  slug: "webcanvas",
  renderer: "webcanvas",
  motion: webcanvasMotion,
  slots: webcanvasSlots,
  demo: {
    buildBlueprint: webcanvasDemoBlueprint,
    contact: { email: "hello@webcanvas.example", phone: "(555) 010-2040" },
  },
  assets: webcanvasAssets,
};
