// Adapter over the bespoke template registry (templates/registry.ts). Demo
// content now lives beside each design in templates/[slug]/demo.ts and is
// registered through its metadata, so publishing a design automatically gives it
// a live demo — nothing to wire here.

import type { AssembledSite } from "@/lib/blueprint/types";
import type { SiteTemplate } from "@/lib/templates/types";
import type { TemplateDemoData } from "@/templates/contracts";
import { createTheme } from "@/lib/agents/theme";
import { assembleSite } from "@/lib/agents/section-assembly";
import {
  getTemplateDemo as getModuleDemo,
  templateSlugsWithDemo as moduleSlugsWithDemo,
} from "@/templates/registry";

export type TemplateDemo = TemplateDemoData;

export function getTemplateDemo(slug: string): TemplateDemo | null {
  return getModuleDemo(slug);
}

export function templateSlugsWithDemo(): string[] {
  return moduleSlugsWithDemo();
}

/**
 * Assembles demo content exactly the way the orchestrator assembles a real
 * project, so the library preview and the customer's generated site come out of
 * the same render path and can never drift apart.
 */
export function buildDemoSite(template: SiteTemplate, demo: TemplateDemo): AssembledSite {
  const theme = createTheme(template.colorPreference, template.visualStyle);
  return {
    ...assembleSite(demo.buildBlueprint(), theme),
    contact: demo.contact,
    renderer: template.renderer,
    templateSlug: template.slug,
  };
}
