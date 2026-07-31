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
  logo?: CompanyLogo;
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
};

export type AssembledPage = {
  slug: string;
  title: string;
  sections: AssembledSection[];
};

export type AssembledSite = {
  pages: AssembledPage[];
  theme: ThemeTokens;
  seo: SiteSeo;
  logo?: CompanyLogo;
  businessName?: string;
};
