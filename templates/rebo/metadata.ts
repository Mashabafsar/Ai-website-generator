import type { TemplateModuleMeta } from "../contracts";
import { reboDemoBlueprint } from "./demo";
import { reboMotion } from "./motion";
import { reboSlots } from "./slots";
import { reboAssets } from "./assets";

export const reboMeta: TemplateModuleMeta = {
  slug: "rebo",
  renderer: "rebo",
  motion: reboMotion,
  slots: reboSlots,
  demo: {
    buildBlueprint: reboDemoBlueprint,
    contact: { email: "info@rebo.com", phone: "(123)456-780" },
  },
  assets: reboAssets,
};
