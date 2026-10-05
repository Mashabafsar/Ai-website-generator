import { getVariantSpec } from "@/lib/sections/registry";
import { limitsForPrompt } from "@/lib/sections/text-limits";
import { ICON_GROUPS } from "@/lib/icons/registry";
import { PALETTE_NAMES } from "@/lib/agents/theme";
import { THEME_FONTS } from "@/templates/shared/fonts";
import { QUOTE_CTA_LABEL } from "@/lib/pricing/contact-cta";
import type { NormalizedRequirements } from "@/lib/agents/requirement-analyst";
import type { WebsiteSection } from "@/lib/blueprint/types";

const GUARDRAILS = `You are a senior conversion copywriter and SEO strategist writing for a US business. Write like a sharp human who knows this industry.

Rules:
1. Use ONLY the facts in <business_facts>. If a claim needs a number or proof you don't have, write around it. Never invent statistics, awards, testimonials, guarantees, or years in business.
2. Lead every section with a concrete benefit for the customer, not a description of the company.
3. Be specific: name the service, the city, and the situation. Replace any generic sentence with a specific one.
4. Banned: "in today's fast-paced world", "unlock", "elevate", "seamless", "cutting-edge", "state-of-the-art", "tailored solutions", "passion for excellence", "look no further", "we pride ourselves".
5. Vary sentence length. No more than two sentences in a row that start the same way. Plain words, grade 7-9 reading level. Stay inside the character limits.
6. Return valid JSON matching <schema>. No commentary.
7. CTAs, button labels, and contact headings must match this industry and what the visitor is doing. A bakery asks for orders or catering ("Order today", "Contact us for your order") — never "book a consultation" or "start a project" unless the business is a consultancy, agency, or clinic. Rewrite every hero CTA, contact CTA, and contact heading for this business; do not leave design-agency defaults.

Layout (the design is already chosen):
- The chosen design lists every page and every section. Fill all of them from this business. Do not add extra pages. Do not drop a listed page or slot.
- Always include the "home" page as listed. Do not invent new slugs, types, variants, or content fields.
- PRICING sections list the customer's services or products as plan names. Never write dollar amounts, currencies, or numbers like "$200" or "300 dollars". Leave planPrices empty. Each plan's button is "${QUOTE_CTA_LABEL}" and goes to Contact so visitors can ask about that service.
- Only ever use ids that appear in the lists below — never invent a font id, palette name, or icon name, and never return a raw hex color or font stack.
- Do NOT generate any frontend code, HTML, CSS, or scripts.
- Do NOT include API keys, secrets, or external tracking code.
- Do NOT copy copyrighted text from other sources. Write original copy from the facts.
- Quote and testimonial slots: if <business_facts> has no real customer words, do not invent a person, a quote, a star rating, or a result. Write the line as the outcome the customer gets, and set the author to the business name.
- Stat and metric slots: if <business_facts> has no number, write the outcome in words. No digits, percentages, or years.`;

const OUTPUT_SHAPE = `Output JSON must match this TypeScript shape:
{
  "business": { "name": string, "industry": string, "description": string, "location"?: string },
  "design": {
    "tone": string,
    "colorPalette": string[],
    "typography": string,
    "visualStyle": string,
    "palette": string,        // EXACTLY one palette name from the list above
    "fontFamily": string      // EXACTLY one font id from the list above
  },
  "pages": [
    {
      "slug": string,           // one of the page slugs listed above (must include "home")
      "title": string,
      "sections": [
        {
          "id": string,          // short unique id, e.g. "hero_1"
          "type": string,        // copied from that page's slot list above
          "variant": string,     // copied from that page's slot list above
          "content": { [field: string]: string | string[] },
          "imageKeywords"?: string[],
          "icons"?: string[]     // icon names, only where the slot list asks for them
        }
      ]
    }
  ],
  "seo": { "title": string, "description": string, "keywords"?: string[] },
  "quoteSignals": string[],
  "complexity": { "level": "simple" | "medium" | "complex", "reasons"?: string[] }
}`;

/** The typefaces and palettes the model may assign to the site. */
function designChoices(): string {
  return [
    "THE TYPEFACE — pick the one `fontFamily` id that best fits this business:",
    THEME_FONTS.map((f) => `   "${f.id}" (${f.name})`).join("\n"),
    "",
    "THE COLOR PALETTE — pick the one `palette` name that best fits this business:",
    PALETTE_NAMES.map((name) => `   "${name}"`).join("\n"),
  ].join("\n");
}

/** The icon allowlist, grouped so the model can find the right family fast. */
function iconChoices(): string {
  return [
    "ALLOWED ICON NAMES — use these exact strings and nothing else:",
    ...ICON_GROUPS.map((g) => `   ${g.group}: ${g.entries.map((e) => e.name).join(", ")}`),
  ].join("\n");
}

/** One page's locked slots, spelled out so the model can only fill them in. */
function pageSlots(sections: string[]): string {
  return sections
    .map((variant, index) => {
      const spec = getVariantSpec(variant);
      if (!spec) return null;
      const fields = spec.fields
        .map((f) => `${f.key}${f.type === "string[]" ? "[]" : ""}`)
        .join(", ");
      const extras = [
        spec.needsImage ? "imageKeywords" : "",
        spec.iconField ? `icons (one per ${spec.iconField} entry)` : "",
      ].filter(Boolean);
      const also = extras.length ? ` (also return ${extras.join(" and ")})` : "";
      return `   ${index + 1}. type "${spec.type}", variant "${spec.variant}" — fields { ${fields} }${also}`;
    })
    .filter(Boolean)
    .join("\n");
}

const PAGE_INTENT: Record<string, string> = {
  home: "commercial — the visitor is looking for this service and deciding whether to get in touch",
  about: "informational — the visitor wants to know who does the work, using only stated facts",
  services: "commercial — the visitor is comparing the specific services named in the facts",
  pricing: "commercial — the visitor wants to know what is offered and how to ask; never state a price",
  contact: "transactional — the visitor is ready to reach the business",
  faq: "informational — the visitor typed a question and wants a direct answer",
  blog: "informational — the visitor wants help with a situation this service solves",
  portfolio: "commercial — the visitor wants to see the kind of work, without invented results",
};

/** Phrases a customer would type, built only from stated services and city. */
export function searchPhrases(req: NormalizedRequirements): {
  primary: string;
  secondary: string[];
  city: string;
} {
  const city = req.business.location?.trim() || "";
  const services = req.services.map((s) => s.trim()).filter(Boolean);
  const primaryBase = services[0] || req.business.industry;
  const primary = city ? `${primaryBase} in ${city}` : primaryBase;
  const secondary = services.slice(1, 6).map((service) => (city ? `${service} in ${city}` : service));
  return { primary, secondary, city };
}

function businessFacts(req: NormalizedRequirements): string {
  return JSON.stringify(
    {
      name: req.business.name,
      industry: req.business.industry,
      description: req.business.description,
      location: req.business.location ?? "",
      services: req.services,
      contact: req.contact,
      goals: req.goals,
      brandingNotes: req.brandingNotes,
    },
    null,
    2
  );
}

function audienceBlock(req: NormalizedRequirements): string {
  return [
    `Who they are: ${req.audience || "Not stated."}`,
    `Who they help most: ${req.demographics || "Not stated."}`,
    `What they need this site to do: ${req.goals || "Not stated."}`,
    "What they worry about: only what these lines imply. Do not invent fears, risks, or problems that are not in the facts.",
  ].join("\n");
}

function seoBlock(req: NormalizedRequirements): string {
  const { primary, secondary, city } = searchPhrases(req);
  const pages = (req.layout.length ? req.layout : req.template.pages)
    .map(
      (page) =>
        `- ${page.slug}: ${PAGE_INTENT[page.slug] ?? "commercial — help this visitor take the next step"}`
    )
    .join("\n");
  return [
    `Primary keyword: ${primary}`,
    secondary.length
      ? `Secondary keywords: ${secondary.join("; ")}`
      : "Secondary keywords: none beyond the primary. Do not invent extra phrases.",
    `City: ${city || "Not stated. Do not invent a city."}`,
    "Search intent per page:",
    pages,
    "Put the primary keyword at the front of seo.title, then the business name. Keep the title under 70 characters.",
    "seo.description states that phrase once, what they offer, and who it is for. Keep it under 160 characters.",
    'seo.keywords is the primary phrase plus the secondary phrases above. No filler words like "quality" or "best".',
    "The home hero headline uses the main service in plain words, still inside the headline character limit.",
    "Service, product, and feature titles are the names people search, not slogans.",
    "FAQ questions are questions people type into search. The answer names the business once.",
    "Use the business name and the city a few times, in natural sentences. Do not repeat a phrase in every line.",
  ].join("\n");
}

function voiceBlock(req: NormalizedRequirements): string {
  const adjectives = req.tone
    .split(/[&,/]| and /i)
    .map((part) => part.trim())
    .filter(Boolean);
  const samples = [req.business.description, req.brandingNotes]
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2);
  return [
    `Adjectives: ${adjectives.length ? adjectives.join(", ") : "Not stated."}`,
    "Sample sentences the owner wrote:",
    samples.length
      ? samples.map((line, index) => `${index + 1}. ${line}`).join("\n")
      : "None provided. Match the adjectives and the facts. Do not invent a brand voice.",
  ].join("\n");
}

function templatePages(req: NormalizedRequirements): string {
  const pages = req.layout.length ? req.layout : req.template.pages;
  return pages
    .map((page) => {
      const note = page.slug === "home" ? "(ALWAYS include)" : "(planned for this audience)";
      return [`PAGE "${page.slug}" — ${page.title} ${note}, fill every listed slot in this EXACT order:`, pageSlots(page.sections)].join(
        "\n"
      );
    })
    .join("\n\n");
}

export function buildHeavyPrompt(req: NormalizedRequirements): string {
  const pages = req.layout.length ? req.layout : req.template.pages;
  const multi = pages.some((p) => p.slug !== "home");
  const pageChoice = multi
    ? [
        `These pages are the whole design: ${pages.map((p) => `"${p.slug}"`).join(", ")}.`,
        "Fill every listed slot on every page. Do not add or drop pages or sections.",
        "Write each section from the facts, even when the brief did not mention that band.",
        `Pricing cards use the customer's services as names, empty planPrices, and a "${QUOTE_CTA_LABEL}" button to Contact — never dollar amounts.`,
      ].join("\n")
    : 'This design is a single page. Return exactly one page with slug "home" and fill every listed slot.';

  const colorNote = req.customColors
    ? `The customer wrote custom brand colors (${[
        req.customColors.primary && `primary ${req.customColors.primary}`,
        req.customColors.secondary && `secondary ${req.customColors.secondary}`,
        req.customColors.accent && `accent ${req.customColors.accent}`,
      ]
        .filter(Boolean)
        .join(", ")}). Keep design.palette unset — the platform will apply these hexes.`
    : req.colorPreferenceExplicit
      ? `The customer asked for ${req.colorPreference} colors, so return the closest palette to that.`
      : `Choose the typeface and palette that suit a ${req.visualStyle.toLowerCase()}, ${req.tone.toLowerCase()} ${req.business.industry} brand.`;

  return [
    GUARDRAILS,
    "",
    limitsForPrompt(),
    "",
    `CHOSEN DESIGN: "${req.template.name}" — a finished website design with a fixed layout.`,
    "Your job is to write its content from the blocks below.",
    "",
    pageChoice,
    "",
    designChoices(),
    "",
    iconChoices(),
    "",
    "THE PAGES AND THEIR LOCKED SECTIONS:",
    templatePages(req),
    "",
    "For every listed page, populate every field of every listed section. Fields ending",
    "with [] are string arrays; keep parallel arrays (e.g. itemTitles/itemBodies) the",
    "same length.",
    "",
    "PHOTOS: sourced automatically from stock providers and editable later. Where a",
    'slot asks for imageKeywords, return 1-3 SHORT concrete phrases describing what',
    'should be IN the photo for that specific section (e.g. "dental hygienist at work"),',
    "not the brand name and not abstract words. Never invent image URLs.",
    "",
    "ICONS: where a slot asks for icons, return one icon name per entry of the named",
    "array, in the same order. Choose the icon that depicts THAT item — match the",
    "service or step, not the industry in general — and avoid repeating an icon within",
    "one section.",
    "",
    colorNote,
    "",
    "<business_facts>",
    "Questionnaire answers. When the owner imported an existing site, those facts are already merged here. This is the complete fact set.",
    businessFacts(req),
    "</business_facts>",
    "",
    "<audience>",
    audienceBlock(req),
    "</audience>",
    "",
    "<seo>",
    seoBlock(req),
    "</seo>",
    "",
    "<voice>",
    voiceBlock(req),
    "</voice>",
    "",
    "<schema>",
    OUTPUT_SHAPE,
    "</schema>",
    "",
    "Return the JSON now.",
  ].join("\n");
}

export function buildLightPrompt(params: {
  section: WebsiteSection;
  instruction: string;
  brandTone: string;
}): string {
  const { section, instruction, brandTone } = params;
  return [
    "You are a senior conversion copywriter editing ONE website section for a US business.",
    "- Return ONLY valid JSON: the updated `content` object for this section. No commentary.",
    "- Keep the SAME field keys and array lengths as the input content.",
    "- Use only facts already in the section, unless the instruction adds a fact. Never invent statistics, awards, testimonials, guarantees, or years in business.",
    "- Lead with a concrete benefit for the customer. Name the service, the city, and the situation.",
    "- Never introduce dollar amounts or prices. Send visitors to Contact our sales instead.",
    "- Do not add code, HTML, or secrets.",
    '- Banned: "in today\'s fast-paced world", "unlock", "elevate", "seamless", "cutting-edge", "state-of-the-art", "tailored solutions", "passion for excellence", "look no further", "we pride ourselves".',
    "- Vary how sentences start. Plain words, grade 7-9 reading level. Stay inside the character limits.",
    "- Do not change names, emails, or phone numbers unless asked.",
    `- Brand tone: ${brandTone}.`,
    limitsForPrompt(),
    "",
    `Section type: ${section.type}, variant: ${section.variant}`,
    "Current content JSON:",
    JSON.stringify(section.content, null, 2),
    "",
    `Instruction: ${instruction}`,
    "",
    'Return JSON of the shape { "content": { ... } } now.',
  ].join("\n");
}
