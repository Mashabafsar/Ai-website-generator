// Sample content behind each design's public live demo. The library preview
// shows the finished, scrollable website rather than a screenshot, so every
// published design needs an entry here — add one when a design is uploaded.

import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import type { SiteTemplate } from "@/lib/templates/types";
import { createTheme } from "@/lib/agents/theme";
import { assembleSite } from "@/lib/agents/section-assembly";
import { forgetechDemoBlueprint } from "@/components/templates/forgetech/demo-blueprint";
import { techvantageDemoBlueprint } from "@/components/templates/techvantage/demo-blueprint";

export type TemplateDemo = {
  buildBlueprint: () => WebsiteBlueprint;
  contact: SiteContact;
};

const DEMOS: Record<string, TemplateDemo> = {
  forgetech: {
    buildBlueprint: forgetechDemoBlueprint,
    contact: { email: "hello@forgetech.example", phone: "(555) 214-8890" },
  },
  techvantage: {
    buildBlueprint: techvantageDemoBlueprint,
    contact: {
      email: "info@techvantage.example",
      phone: "(920) 006 9580",
      address: "456 Lone Star Parkway, Austin, TX 78701",
    },
  },
};

export function getTemplateDemo(slug: string): TemplateDemo | null {
  return DEMOS[slug] ?? null;
}

export function templateSlugsWithDemo(): string[] {
  return Object.keys(DEMOS);
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
