import type { TemplateModuleMeta } from "../contracts";
import { resumeDemoBlueprint } from "./demo";
import { resumeMotion } from "./motion";
import { resumeSlots } from "./slots";
import { resumeAssets } from "./assets";

export const resumeMeta: TemplateModuleMeta = {
  slug: "resume",
  renderer: "resume",
  motion: resumeMotion,
  slots: resumeSlots,
  demo: {
    buildBlueprint: resumeDemoBlueprint,
    contact: { email: "myfolio@gmail.com", phone: "647-310-1234" },
  },
  assets: resumeAssets,
};
