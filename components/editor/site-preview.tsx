import type { CSSProperties } from "react";
import type { AssembledSite } from "@/lib/blueprint/types";
import { SECTION_COMPONENTS } from "@/components/website-sections/sections";
import { SiteHeader } from "@/components/website-sections/ui";
import { BespokePreview, hasBespokePreview } from "@/templates/preview-registry";

const NAV: Array<{ type: string; label: string }> = [
  { type: "about", label: "About" },
  { type: "services", label: "Services" },
  { type: "products", label: "Products" },
  { type: "features", label: "Features" },
  { type: "portfolio", label: "Work" },
  { type: "pricing", label: "Pricing" },
  { type: "faq", label: "FAQ" },
  { type: "contact", label: "Contact" },
];

/** Renders a single assembled page, applying theme tokens as CSS variables. */
export function SitePreview({ site, pageSlug }: { site: AssembledSite; pageSlug?: string }) {
  // Bespoke designs draw themselves; everything else goes through the approved
  // section component registry.
  if (hasBespokePreview(site.renderer) || hasBespokePreview(site.templateSlug)) {
    return <BespokePreview site={site} pageSlug={pageSlug} />;
  }

  const page = site.pages.find((p) => p.slug === pageSlug) ?? site.pages[0];
  if (!page) return null;

  const presentTypes = new Set(page.sections.map((s) => s.type));
  const nav = NAV.filter((n) => presentTypes.has(n.type)).map((n) => ({
    href: `#${n.type}`,
    label: n.label,
  }));

  const themeStyle: CSSProperties = {
    ["--primary" as string]: site.theme.colors.primary,
    ["--secondary" as string]: site.theme.colors.secondary,
    ["--accent" as string]: site.theme.colors.accent,
    background: site.theme.colors.background,
    color: site.theme.colors.foreground,
  };

  return (
    <div id="top" style={themeStyle} className="font-sans">
      <SiteHeader
        logo={site.logo ?? site.theme.logo}
        businessName={site.businessName ?? site.seo.title.split("|")[0]?.trim() ?? "Website"}
        nav={nav}
      />
      {page.sections.map((section) => {
        const Component = SECTION_COMPONENTS[section.componentName];
        if (!Component) return null;
        return (
          <div key={section.id} id={section.type}>
            <Component {...section.props} />
          </div>
        );
      })}
    </div>
  );
}
