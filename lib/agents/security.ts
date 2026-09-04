import { isAllowedImageUrl } from "@/lib/images/provider";
import { normalizeIconName } from "@/lib/icons/registry";
import { clampBlueprintText } from "@/lib/sections/text-limits";
import type { StockImageReference, WebsiteBlueprint } from "@/lib/blueprint/types";

// Security Guardrail Agent — sanitizes AI-generated text before it is stored or
// rendered. Removes script/style injection, javascript: URLs, event handlers,
// and obvious secret-looking tokens.

function sanitizeImage(img: StockImageReference | null | undefined): StockImageReference | null {
  if (!img || !img.url || !isAllowedImageUrl(img.url)) return null;
  return {
    ...img,
    altText: sanitizeText(img.altText || "Website image").slice(0, 160),
    photographer: img.photographer ? sanitizeText(img.photographer).slice(0, 80) : undefined,
    licenseInfo: img.licenseInfo ? sanitizeText(img.licenseInfo).slice(0, 160) : undefined,
  };
}

const SECRET_PATTERNS: RegExp[] = [
  /sk_live_[A-Za-z0-9]+/g,
  /sk_test_[A-Za-z0-9]+/g,
  /AKIA[0-9A-Z]{16}/g,
  /ghp_[A-Za-z0-9]{20,}/g,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
];

export function sanitizeText(input: string): string {
  let out = input;
  out = out.replace(/<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi, "");
  out = out.replace(/<\s*style[\s\S]*?<\s*\/\s*style\s*>/gi, "");
  out = out.replace(/<[^>]+>/g, ""); // strip any remaining HTML tags
  out = out.replace(/javascript:/gi, "");
  out = out.replace(/on\w+\s*=/gi, "");
  for (const re of SECRET_PATTERNS) out = out.replace(re, "[redacted]");
  return out;
}

function sanitizeValue(v: string | string[]): string | string[] {
  return Array.isArray(v) ? v.map(sanitizeText) : sanitizeText(v);
}

/** Deep-sanitize every content string in the blueprint. Mutates and returns it. */
export function sanitizeBlueprint(blueprint: WebsiteBlueprint): WebsiteBlueprint {
  clampBlueprintText(blueprint);

  for (const page of blueprint.pages) {
    for (const section of page.sections) {
      for (const [k, val] of Object.entries(section.content)) {
        section.content[k] = sanitizeValue(val);
      }
      section.selectedImage = sanitizeImage(section.selectedImage);
      if (section.itemImages) {
        section.itemImages = section.itemImages.map((img) => sanitizeImage(img));
      }
      // Only allowlisted icon names may reach a renderer; anything else becomes
      // null and the design falls back to its own glyph.
      if (section.icons) {
        section.icons = section.icons.map((name) => normalizeIconName(name));
      }
    }
  }
  blueprint.seo.title = sanitizeText(blueprint.seo.title).slice(0, 70);
  blueprint.seo.description = sanitizeText(blueprint.seo.description).slice(0, 200);

  // Ensure a "home" page always leads the site. Multi-page designs keep every
  // page; single-page designs are unaffected (their only page becomes home).
  if (blueprint.pages.length) {
    const homeIdx = blueprint.pages.findIndex((p) => p.slug === "home");
    if (homeIdx > 0) {
      const [home] = blueprint.pages.splice(homeIdx, 1);
      blueprint.pages.unshift(home);
    } else if (homeIdx === -1) {
      blueprint.pages[0].slug = "home";
    }
  }

  return blueprint;
}
