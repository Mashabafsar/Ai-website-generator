import { getVariantSpec } from "@/lib/sections/registry";
import { limitsForPrompt } from "@/lib/sections/text-limits";
import { ICON_GROUPS } from "@/lib/icons/registry";
import { PALETTE_NAMES } from "@/lib/agents/theme";
import { THEME_FONTS } from "@/templates/shared/fonts";
import type { NormalizedRequirements } from "@/lib/agents/requirement-analyst";
import type { WebsiteSection } from "@/lib/blueprint/types";

const GUARDRAILS = `You are a website COPYWRITER and art director. Follow these rules strictly:
- Return ONLY valid JSON. No prose, no markdown fences, no comments.
- The website LAYOUT is already chosen and FIXED. Write its content and pick its
  typeface, color palette, icons, and photo keywords from the lists given below.
- Emit EXACTLY the sections listed below, in the SAME order, with the SAME
  "type" and "variant" values. Do NOT add, remove, reorder, or substitute any
  section, and do NOT invent new variants or content fields.
- Only ever use ids that appear in the lists below — never invent a font id,
  palette name, or icon name, and never return a raw hex color or font stack.
- Do NOT generate any frontend code, HTML, CSS, or scripts.
- Do NOT include API keys, secrets, or external tracking code.
- Do NOT copy copyrighted text from other sources; write original copy.
- Write SHORT, punchy copy only — headlines, one-line subheads, brief bullets.`;

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

/**
 * Describes every page the design supports. "home" is mandatory; the rest are
 * optional and the model picks which to include based on the business — but it
 * can only ever choose from THIS list and must keep each page's slots verbatim.
 */
function templatePages(req: NormalizedRequirements): string {
  return req.template.pages
    .map((page) => {
      const optional = page.slug === "home" ? "(ALWAYS include)" : "(OPTIONAL — include only if it fits the business)";
      return [`PAGE "${page.slug}" — ${page.title} ${optional}, sections in this EXACT order:`, pageSlots(page.sections)].join(
        "\n"
      );
    })
    .join("\n\n");
}

export function buildHeavyPrompt(req: NormalizedRequirements): string {
  const requirements = {
    business: req.business,
    audience: req.audience,
    demographics: req.demographics,
    goals: req.goals,
    brandingNotes: req.brandingNotes,
    tone: req.tone,
    services: req.services,
    contact: req.contact,
  };

  const optionalSlugs = req.template.pages.filter((p) => p.slug !== "home").map((p) => `"${p.slug}"`);
  const pageChoice = optionalSlugs.length
    ? [
        `This design supports these OPTIONAL pages: ${optionalSlugs.join(", ")}.`,
        "YOU decide which of them to include based on the business — a simple business",
        "may only need home; a richer one benefits from more. Always include \"home\".",
        "Only emit pages from the list below, and never invent a page or a slot.",
      ].join("\n")
    : 'This design is a single page. Return exactly one page with slug "home".';

  return [
    GUARDRAILS,
    "",
    limitsForPrompt(),
    "",
    `CHOSEN DESIGN: "${req.template.name}" — a finished website design with a fixed`,
    `layout and a ${req.tone.toLowerCase()} tone. Your job is to write its content.`,
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
    "For every page you include, populate every field of every section. Fields ending",
    "with [] are string arrays; keep parallel arrays (e.g. itemTitles/itemBodies) the",
    "same length.",
    "",
    "PHOTOS: sourced automatically from stock providers and editable later. Where a",
    "slot asks for imageKeywords, return 1-3 SHORT concrete phrases describing what",
    "should be IN the photo for that specific section (e.g. \"dental hygienist at work\"),",
    "not the brand name and not abstract words. Never invent image URLs.",
    "",
    "ICONS: where a slot asks for icons, return one icon name per entry of the named",
    "array, in the same order. Choose the icon that depicts THAT item — match the",
    "service or step, not the industry in general — and avoid repeating an icon within",
    "one section.",
    "",
    "BUSINESS REQUIREMENTS (normalized questionnaire):",
    JSON.stringify(requirements, null, 2),
    "",
    `Write original, on-brand copy in a ${req.tone} tone for ${req.audience || "this audience"}.`,
    req.goals ? `Website goals: ${req.goals}` : "",
    `Choose the typeface and palette that suit a ${req.visualStyle.toLowerCase()},`,
    `${req.tone.toLowerCase()} ${req.business.industry} brand${req.brandingNotes ? ` (${req.brandingNotes})` : ""}.`,
    req.customColors
      ? `The customer wrote custom brand colors (${[
          req.customColors.primary && `primary ${req.customColors.primary}`,
          req.customColors.secondary && `secondary ${req.customColors.secondary}`,
          req.customColors.accent && `accent ${req.customColors.accent}`,
        ]
          .filter(Boolean)
          .join(", ")}). Keep design.palette unset — the platform will apply these hexes.`
      : req.colorPreferenceExplicit
        ? `The customer asked for ${req.colorPreference} colors, so return the closest palette to that.`
        : "",
    "",
    OUTPUT_SHAPE,
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
    "You are editing ONE website section. Follow these rules strictly:",
    "- Return ONLY valid JSON: the updated `content` object for this section.",
    "- Keep the SAME field keys and array lengths as the input content.",
    "- Do not change facts (names, emails, phone, prices) unless asked.",
    "- Do not add code, HTML, or secrets. Write original copy.",
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
