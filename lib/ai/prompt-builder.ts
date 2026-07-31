import { registryForPrompt } from "@/lib/sections/registry";
import { limitsForPrompt } from "@/lib/sections/text-limits";
import type { NormalizedRequirements } from "@/lib/agents/requirement-analyst";
import type { WebsiteSection } from "@/lib/blueprint/types";

const GUARDRAILS = `You are a website planning engine. Follow these rules strictly:
- Return ONLY valid JSON. No prose, no markdown fences, no comments.
- Use ONLY the approved section types and variants listed below.
- Do NOT invent unsupported components or variants.
- Do NOT generate any frontend code, HTML, CSS, or scripts.
- Do NOT include API keys, secrets, or external tracking code.
- Do NOT copy copyrighted text from other sources; write original copy.
- Write SHORT, punchy copy only — headlines, one-line subheads, brief bullets.`;

const OUTPUT_SHAPE = `Output JSON must match this TypeScript shape:
{
  "business": { "name": string, "industry": string, "description": string, "location"?: string },
  "design": { "tone": string, "colorPalette": string[], "typography": string, "visualStyle": string },
  "pages": [
    {
      "slug": "home",           // single-page site: exactly ONE page with slug "home"
      "title": string,
      "sections": [
        {
          "id": string,          // short unique id, e.g. "hero_1"
          "type": string,        // one of the approved types
          "variant": string,     // one of that type's approved variants
          "content": { [field: string]: string | string[] },
          "imageKeywords"?: string[]
        }
      ]
    }
  ],
  "seo": { "title": string, "description": string, "keywords"?: string[] },
  "quoteSignals": string[],
  "complexity": { "level": "simple" | "medium" | "complex", "reasons"?: string[] }
}`;

export function buildHeavyPrompt(req: NormalizedRequirements): string {
  const requirements = {
    business: req.business,
    audience: req.audience,
    services: req.services,
    tone: req.tone,
    visualStyle: req.visualStyle,
    colorPreference: req.colorPreference,
    pages: req.pages,
    features: req.features,
    contact: req.contact,
  };

  return [
    GUARDRAILS,
    "",
    limitsForPrompt(),
    "",
    "APPROVED SECTION REGISTRY (type -> variants -> content fields):",
    registryForPrompt(),
    "",
    "For each section, populate every field shown for its variant. Fields ending",
    "with [] are string arrays; keep parallel arrays (e.g. itemTitles/itemBodies)",
    "the same length. Provide imageKeywords for sections marked (has image).",
    "Service/product/feature/portfolio item photos are auto-sourced and editable",
    "in the editor (upload or Pexels/Shutterstock search) — do not invent image URLs.",
    "",
    "BUSINESS REQUIREMENTS (normalized questionnaire):",
    JSON.stringify(requirements, null, 2),
    "",
    "Plan a cohesive SINGLE-PAGE website: exactly ONE page with slug \"home\" that",
    "contains ALL sections in a logical top-to-bottom scroll order. Start with a",
    "hero section and end with a footer section. Do NOT create additional pages —",
    "the selected pages (About, Services, Pricing, Contact, Portfolio, etc.) become",
    "sections on this one page. Every section MUST use a variant from the approved",
    "registry — those variants map 1:1 to our fixed UI component library (retro hero,",
    "about mosaic, services cards, features hover panel, case studies, process pins,",
    "testimonials bento, FAQ accordion, pricing tiers, contact boxes, CTA card, footer).",
    "Never invent new layouts. Write original, on-brand copy in a " + req.tone + " tone.",
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
