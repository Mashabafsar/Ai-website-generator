import { getVariantSpec } from "@/lib/sections/registry";
import { generateCompanyLogo } from "@/lib/branding/logo";
import type {
  WebsiteBlueprint,
  AssembledSite,
  AssembledPage,
  AssembledSection,
  ThemeTokens,
} from "@/lib/blueprint/types";

/**
 * Section Assembly Agent — converts a validated blueprint into a renderable tree
 * of { componentName, props }. It never emits raw UI code; it only maps approved
 * variants to approved components and injects content + images as props.
 */
export function assembleSite(blueprint: WebsiteBlueprint, theme: ThemeTokens): AssembledSite {
  const logo = theme.logo ?? generateCompanyLogo(blueprint.business.name, theme.colors.primary);
  const themeWithLogo: ThemeTokens = { ...theme, logo };

  const pages: AssembledPage[] = blueprint.pages.map((page) => {
    const sections: AssembledSection[] = page.sections
      .map((section): AssembledSection | null => {
        const spec = getVariantSpec(section.variant);
        if (!spec) return null;
        const brandProps = { logo, businessName: blueprint.business.name };
        return {
          id: section.id,
          type: section.type,
          variant: section.variant,
          componentName: spec.componentName,
          props: {
            ...section.content,
            image: section.selectedImage ?? null,
            itemImages: section.itemImages ?? [],
            icons: section.icons ?? [],
            ...(section.type === "footer" || section.type === "hero" ? brandProps : {}),
          },
        };
      })
      .filter((s): s is AssembledSection => s !== null);

    return { slug: page.slug, title: page.title, sections };
  });

  return {
    pages,
    theme: themeWithLogo,
    seo: blueprint.seo,
    logo,
    businessName: blueprint.business.name,
  };
}
