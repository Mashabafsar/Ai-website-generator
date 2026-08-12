import { getVariantSpec } from "@/lib/sections/registry";
import { limitsForPrompt } from "@/lib/sections/text-limits";
import type { NormalizedRequirements } from "@/lib/agents/requirement-analyst";
import type { WebsiteSection } from "@/lib/blueprint/types";

const GUARDRAILS = `You are a website COPYWRITER, not a designer. Follow these rules strictly:
- Return ONLY valid JSON. No prose, no markdown fences, no comments.
- The website design is already chosen and FIXED. Write content for it.
- Emit EXACTLY the sections listed below, in the SAME order, with the SAME
  "type" and "variant" values. Do NOT add, remove, reorder, or substitute any
  section, and do NOT invent new variants or content fields.
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
      "slug": "home",           // exactly ONE page with slug "home"
      "title": string,
      "sections": [
        {
          "id": string,          // short unique id, e.g. "hero_1"
          "type": string,        // copied from the slot list above
          "variant": string,     // copied from the slot list above
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

/** The template's locked slots, spelled out so the model can only fill them in. */
function templateSlots(req: NormalizedRequirements): string {
  return req.template.sections
    .map((variant, index) => {
      const spec = getVariantSpec(variant);
      if (!spec) return null;
      const fields = spec.fields
        .map((f) => `${f.key}${f.type === "string[]" ? "[]" : ""}`)
        .join(", ");
      const image = spec.needsImage ? " (also return imageKeywords)" : "";
      return `${index + 1}. type "${spec.type}", variant "${spec.variant}" — fields { ${fields} }${image}`;
    })
    .filter(Boolean)
    .join("\n");
}

export function buildHeavyPrompt(req: NormalizedRequirements): string {
  const requirements = {
    business: req.business,
    audience: req.audience,
    services: req.services,
    contact: req.contact,
  };

  return [
    GUARDRAILS,
    "",
    limitsForPrompt(),
    "",
    `CHOSEN DESIGN: "${req.template.name}" — a finished website design with a fixed`,
    `layout and a ${req.tone.toLowerCase()} tone. Your job is to write its content.`,
    "",
    `THE ${req.template.sections.length} SECTIONS TO FILL, IN THIS EXACT ORDER:`,
    templateSlots(req),
    "",
    "Populate every field listed for each section. Fields ending with [] are string",
    "arrays; keep parallel arrays (e.g. itemTitles/itemBodies) the same length.",
    "Photos are auto-sourced from stock providers and editable later — return",
    "imageKeywords where asked and never invent image URLs.",
    "",
    "BUSINESS REQUIREMENTS (normalized questionnaire):",
    JSON.stringify(requirements, null, 2),
    "",
    'Return exactly ONE page with slug "home" holding those sections in that order.',
    `Write original, on-brand copy in a ${req.tone} tone for ${req.audience || "this audience"}.`,
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
