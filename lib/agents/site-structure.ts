import type { NormalizedRequirements } from "@/lib/agents/requirement-analyst";
import { isCatalogPage, type PageType } from "@/lib/blueprint/page-catalog";
import { getVariantSpec } from "@/lib/sections/registry";

/** Business copy used to suggest (not force) pages and sections. */
export type ContentSignals = {
  industry: string;
  description: string;
  audience?: string;
  demographics?: string;
  goals?: string;
  brandingNotes?: string;
  services: string[];
};

export function signalsFromRequirements(req: NormalizedRequirements): ContentSignals {
  return {
    industry: req.business.industry,
    description: req.business.description,
    audience: req.audience,
    demographics: req.demographics,
    goals: req.goals,
    brandingNotes: req.brandingNotes,
    services: req.services,
  };
}

export function signalsFromAnswers(answers: {
  industry: string;
  description: string;
  targetAudience?: string;
  demographics?: string;
  goals?: string;
  brandingNotes?: string;
  services: string[];
}): ContentSignals {
  return {
    industry: answers.industry,
    description: answers.description,
    audience: answers.targetAudience,
    demographics: answers.demographics,
    goals: answers.goals,
    brandingNotes: answers.brandingNotes,
    services: answers.services,
  };
}

function contentHaystack(signals: ContentSignals): string {
  return [
    signals.industry,
    signals.description,
    signals.audience,
    signals.demographics,
    signals.goals,
    signals.brandingNotes,
    signals.services.join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function mentions(signals: ContentSignals, ...needles: string[]): boolean {
  const haystack = contentHaystack(signals);
  return needles.some((n) => haystack.includes(n));
}

export function wantsServices(signals: ContentSignals): boolean {
  return signals.services.length >= 1 || mentions(signals, "service", "offer", "solution", "package");
}

export function wantsAbout(signals: ContentSignals): boolean {
  return (
    signals.description.trim().length >= 40 ||
    mentions(signals, "about", "team", "story", "mission", "founded", "who we")
  );
}

export function wantsPortfolio(signals: ContentSignals): boolean {
  return (
    mentions(signals, "portfolio", "project", "gallery", "case stud", "our work") ||
    looksCreative(signals)
  );
}

export function wantsPricing(signals: ContentSignals): boolean {
  if (looksLocalService(signals)) {
    return mentions(signals, "pric", "membership", "package", "subscription");
  }
  return (
    mentions(signals, "pric", "plan", "tier", "package", "subscription", "membership", "retainer") ||
    looksSoftware(signals)
  );
}

export function wantsFaq(signals: ContentSignals): boolean {
  return (
    signals.services.length >= 3 ||
    mentions(signals, "faq", "question", "how long", "process", "appoint") ||
    looksLocalService(signals)
  );
}

function looksLocalService(signals: ContentSignals): boolean {
  return /\b(dental|dentist|clinic|salon|spa|barber|restaurant|cafe|gym|fitness|lawyer|attorney|plumb|hvac|electric|hotel|school|church)\b/i.test(
    contentHaystack(signals)
  );
}

function looksCreative(signals: ContentSignals): boolean {
  return /\b(photo|architect|interior|design studio|agency|stylist|film|art|studio)\b/i.test(
    contentHaystack(signals)
  );
}

function looksSoftware(signals: ContentSignals): boolean {
  return /\b(software|saas|app\b|developer|platform|startup)\b/i.test(contentHaystack(signals));
}

export function wantsBlog(signals: ContentSignals): boolean {
  return mentions(signals, "blog", "article", "insight", "news", "journal", "resource");
}

/**
 * Suggests catalog pages from business copy when the planner model is offline.
 */
export function decideSitePages(
  signals: ContentSignals,
  templatePages: { slug: string }[]
): PageType[] {
  const supported = templatePages
    .map((p) => p.slug)
    .filter((slug): slug is PageType => isCatalogPage(slug));
  const has = (slug: PageType) => supported.includes(slug);
  const keep: PageType[] = ["home"];
  const add = (slug: PageType) => {
    if (has(slug) && !keep.includes(slug)) keep.push(slug);
  };

  if (wantsServices(signals)) add("services");
  if (wantsAbout(signals)) add("about");
  if (wantsPortfolio(signals)) add("portfolio");
  if (wantsPricing(signals)) add("pricing");
  if (wantsFaq(signals)) add("faq");
  if (wantsBlog(signals)) add("blog");
  add("contact");

  return supported.filter((slug) => keep.includes(slug));
}

export function shouldKeepSectionType(type: string, signals: ContentSignals): boolean {
  if (type === "pricing") return wantsPricing(signals);
  if (type === "faq") return wantsFaq(signals);
  if (type === "portfolio") return wantsPortfolio(signals);
  if (type === "products") return wantsServices(signals);
  return true;
}

export function isStructuralSection(variant: string): boolean {
  const spec = getVariantSpec(variant);
  if (!spec) return false;
  return spec.type === "hero" || spec.type === "footer";
}
