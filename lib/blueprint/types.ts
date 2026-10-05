// Central domain types for the Website Blueprint — the structured object the AI
// produces and the app renders. Keep in sync with lib/blueprint/schema.ts (Zod).

export type StockImageReference = {
  provider: "shutterstock" | "pexels" | "unsplash" | "placeholder" | "upload";
  providerImageId?: string;
  url: string;
  photographer?: string;
  attributionRequired?: boolean;
  licenseInfo?: string;
  altText: string;
  /** What the photo shows, from the provider or vision analysis. Drives placement. */
  description?: string;
};

/** Optional per-section color overrides. Empty/unset means inherit the site theme. */
export type SectionTheme = {
  background?: string;
  foreground?: string;
  accent?: string;
};

export type WebsiteSection = {
  id: string;
  type: string; // e.g. "hero" (must be an allowed section type)
  variant: string; // e.g. "hero-split-with-image" (must be an allowed variant)
  content: Record<string, string | string[]>;
  imageKeywords?: string[];
  selectedImage?: StockImageReference | null;
  /** Per-item images for services / products / portfolio rows (parallel to itemTitles). */
  itemImages?: (StockImageReference | null)[];
  /**
   * Per-item icon names from the allowlist (lib/icons/registry.ts), parallel to
   * the variant's `iconField` array. A null entry, or an absent list on a
   * project generated before icons existed, means the design's own glyph.
   */
  icons?: (string | null)[];
  /** Per-section colors. Omitted on older projects — they inherit the site theme. */
  theme?: SectionTheme;
};

export type WebsitePage = {
  slug: string;
  title: string;
  sections: WebsiteSection[];
};

export type SiteSeo = {
  title: string;
  description: string;
  keywords?: string[];
};

export type QuoteSignal = string;

export type CompanyLogo = {
  initials: string;
  dataUrl: string;
  svg: string;
};

export type ThemeTokens = {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  radius: string;
  fontStyle: string;
  /**
   * User-picked typeface for the whole site — an id from the theme font
   * catalog (templates/shared/fonts.ts). Unset means the template's own fonts.
   */
  fontFamily?: string;
  /**
   * Name of the catalog palette this site was deliberately art-directed to (by
   * the heavy model, or by an explicit questionnaire answer). Unset means the
   * colors are just the auto default, which bespoke designs override with their
   * own signature accent.
   */
  palette?: string;
  logo?: CompanyLogo;
  /**
   * URL of a logo mark uploaded by the user. Unlike `logo`, which is always
   * auto-generated, this is only set when the user supplies their own artwork,
   * so templates can use it to decide whether to swap their built-in mark.
   */
  logoUrl?: string;
  /**
   * Questionnaire / editor brand tone (e.g. "Bold & energetic"). Used to derive
   * contrast for dark bands vs body surfaces. Unset keeps a balanced default.
   */
  tone?: string;
};

export type WebsiteBlueprint = {
  projectId?: string;
  business: {
    name: string;
    industry: string;
    description: string;
    location?: string;
  };
  design: {
    tone: string;
    colorPalette: string[];
    typography: string;
    visualStyle: string;
    /**
     * The heavy model's design direction for this business, chosen from the
     * theme catalogs. Validated before it reaches the theme; unset (or unknown)
     * leaves the questionnaire's preference and the template's own type in place.
     */
    palette?: string;
    fontFamily?: string;
  };
  pages: WebsitePage[];
  seo: SiteSeo;
  quoteSignals: QuoteSignal[];
  complexity?: {
    level: "simple" | "medium" | "complex";
    reasons?: string[];
  };
};

// ---- Assembled output (blueprint mapped onto concrete section components) ----

export type AssembledSection = {
  id: string;
  type: string;
  variant: string;
  componentName: string;
  props: Record<string, unknown>;
  /** Per-section color overrides, forwarded from the blueprint. */
  theme?: SectionTheme;
};

export type AssembledPage = {
  slug: string;
  title: string;
  sections: AssembledSection[];
};

/**
 * The business's real contact details. Designs without a contact section still
 * need them — ForgeTech, for example, puts the email in its header and wires
 * its closing call-to-action to a mailto link.
 */
export type SiteContact = {
  email?: string;
  phone?: string;
  /** The business's own location, as given in the questionnaire. */
  address?: string;
};

export type AssembledSite = {
  pages: AssembledPage[];
  theme: ThemeTokens;
  seo: SiteSeo;
  logo?: CompanyLogo;
  businessName?: string;
  /** Industry from the questionnaire — used for industry-aware CTA fallbacks. */
  industry?: string;
  contact?: SiteContact;
  /** Which renderer draws this site: "standard-sections" or a bespoke design. */
  renderer?: string;
  templateSlug?: string;
};
