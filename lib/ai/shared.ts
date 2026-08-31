import { buildHeavyPrompt, buildLightPrompt } from "@/lib/ai/prompt-builder";
import { buildMockBlueprint } from "@/lib/ai/mock-blueprint";
import { validateBlueprint, extractJson } from "@/lib/blueprint/schema";
import { getVariantSpec } from "@/lib/sections/registry";
import type { NormalizedRequirements } from "@/lib/agents/requirement-analyst";
import type { WebsiteBlueprint, WebsiteSection } from "@/lib/blueprint/types";

export type SectionContent = Record<string, string | string[]>;

/** Deterministic local edit used when every AI provider fails. */
export function deterministicRevise(section: WebsiteSection, instruction: string): SectionContent {
  const content: SectionContent = { ...section.content };
  const lower = instruction.toLowerCase();
  const transform = (v: string): string => {
    if (lower.includes("short")) return v.split(". ")[0].slice(0, 90) + (v.length > 90 ? "…" : "");
    if (lower.includes("professional")) return v.replace(/!+/g, ".");
    if (lower.includes("bold") || lower.includes("energetic")) return v.replace(/\.$/, "!");
    return v;
  };
  for (const [k, val] of Object.entries(content)) {
    if (typeof val === "string") content[k] = transform(val);
    else if (Array.isArray(val)) content[k] = val.map(transform);
  }
  return content;
}

/**
 * Shared generate/revise helpers used by every provider. Each provider only has
 * to supply a `runPrompt(prompt, model)` function.
 */
/** Soft-normalize common model mistakes so Zod validation is more forgiving. */
function softNormalize(input: unknown): unknown {
  if (!input || typeof input !== "object") return input;
  const obj = input as Record<string, unknown>;
  const seo = obj.seo as Record<string, unknown> | undefined;
  if (seo) {
    if (typeof seo.title === "string") seo.title = seo.title.slice(0, 70);
    if (typeof seo.description === "string") seo.description = seo.description.slice(0, 200);
  }
  const pages = obj.pages;
  if (Array.isArray(pages) && pages.length > 0) {
    // Guarantee a "home" page: if the model never labelled one, treat the first
    // page as home. Otherwise leave the model's (possibly multi-page) set alone.
    const hasHome = pages.some(
      (p) => p && typeof p === "object" && (p as Record<string, unknown>).slug === "home"
    );
    if (!hasHome) {
      const first = pages[0] as Record<string, unknown>;
      if (first && typeof first === "object") first.slug = "home";
    }
  }
  return obj;
}

export async function generateBlueprintWithRunner(
  req: NormalizedRequirements,
  runPrompt: (prompt: string, model: string) => Promise<string>,
  model: string,
  label: string
): Promise<WebsiteBlueprint> {
  const prompt = buildHeavyPrompt(req);
  let raw = await runPrompt(prompt, model);
  let parsed = validateBlueprint(softNormalize(extractJson(raw) ?? {}));

  if (!parsed.valid) {
    const repair = [
      "Your previous JSON was invalid. Fix these issues and return ONLY corrected JSON:",
      ...parsed.errors.map((e) => `- ${e}`),
      "",
      'Remember: always include a page with slug "home"; only use the page slugs and',
      "section slots listed in the design. SEO title ≤ 70 chars, description ≤ 200.",
      "",
      "Previous output:",
      raw,
    ].join("\n");
    raw = await runPrompt(repair, model);
    parsed = validateBlueprint(softNormalize(extractJson(raw) ?? {}));
  }

  if (parsed.valid) return parsed.blueprint;

  throw new Error(`[${label}] blueprint invalid after repair: ${parsed.errors.join("; ")}`);
}

export async function reviseSectionWithRunner(
  params: { section: WebsiteSection; instruction: string; brandTone: string },
  runPrompt: (prompt: string, model: string) => Promise<string>,
  model: string
): Promise<SectionContent> {
  const { section, instruction, brandTone } = params;
  const prompt = buildLightPrompt({ section, instruction, brandTone });
  const raw = await runPrompt(prompt, model);
  const json = extractJson(raw) as { content?: SectionContent } | null;
  const next = json?.content;
  if (!next || typeof next !== "object") {
    throw new Error("Invalid edit response");
  }

  const spec = getVariantSpec(section.variant);
  const allowed = new Set(spec?.fields.map((f) => f.key) ?? Object.keys(section.content));
  const safe: SectionContent = { ...section.content };
  for (const [k, v] of Object.entries(next)) {
    if (allowed.has(k) && (typeof v === "string" || Array.isArray(v))) {
      safe[k] = v as string | string[];
    }
  }
  return safe;
}

export { buildMockBlueprint };
