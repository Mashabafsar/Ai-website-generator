import { createHash } from "node:crypto";
import { requireUser, jsonOk, jsonError, readJson } from "@/lib/http";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { CreditLedgerReason } from "@/lib/constants";
import { withUsageCapture } from "@/lib/ai/usage";
import { persistUsageEvents } from "@/lib/ai/usage-record";
import {
  assertAndSpend,
  nextLedgerAttemptKey,
  refundSpend,
  InsufficientCreditsError,
} from "@/lib/credits/credits";
import {
  fetchAndParseWebsite,
  extractQuestionnaireFields,
  ScrapeError,
} from "@/lib/scraper/website";
import { importBrandFromSite } from "@/lib/scraper/brand";
import { describePhotos, visionAvailable } from "@/lib/ai/vision";
import { getOwnedProject } from "@/lib/projects/projects";
import { defaultQuestionnaire } from "@/lib/questionnaire/schema";
import {
  hasImportedBrand,
  hasImportedTheme,
  importedAssetPaths,
  parseImportedBrand,
  type ImportedBrand,
} from "@/lib/branding/imported-brand";

// Website Import — scrapes a customer's existing site and maps it to
// questionnaire fields, then pulls logo / photos / colours / typeface.
// Importing costs credits (default 10); the charge is refunded if the site
// can't be read. Branding/asset failures are fail-soft — the customer still
// keeps the text prefill. Token usage still lands in the admin ledger as `scrape_extract`,
// and the look at each imported photo as `image_analysis`.

type Body = { url?: string; projectId?: string };

export async function POST(req: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await readJson<Body>(req);
  const url = (body?.url || "").trim();
  const projectId = (body?.projectId || "").trim();
  if (!url) {
    return jsonError("Enter a website URL.", 400, "INVALID_URL");
  }
  if (!projectId) {
    return jsonError("We couldn't find that website project.", 400, "INVALID_PROJECT");
  }

  const project = await getOwnedProject(user.id, projectId);
  if (!project) return jsonError("We couldn't find that website project.", 404, "NOT_FOUND");

  const cost = env.credits.costScrapeImport;
  const urlHash = createHash("sha256").update(url.toLowerCase()).digest("hex").slice(0, 16);
  const spendKey = await nextLedgerAttemptKey({
    reason: CreditLedgerReason.SCRAPE_IMPORT,
    base: `scrape_import:${projectId}:${urlHash}`,
  });

  let spent = false;
  try {
    const result = await assertAndSpend({
      userId: user.id,
      amount: cost,
      reason: CreditLedgerReason.SCRAPE_IMPORT,
      projectId,
      idempotencyKey: spendKey,
    });
    spent = result.spent;
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return jsonError(
        "Not enough credits to read a website. Please buy more.",
        402,
        "INSUFFICIENT_CREDITS",
        { required: err.required, available: err.available }
      );
    }
    throw err;
  }

  try {
    const site = await fetchAndParseWebsite(url);
    // Branding, including looking at each photo, runs alongside the text
    // extraction so the import takes no longer than before.
    const brandTask = withUsageCapture(async (): Promise<ImportedBrand | null> => {
      try {
        return await withPhotoAnalysis(await importBrandFromSite({ projectId, site }), site.url);
      } catch (err) {
        // A bad logo / photo / theme pass must not refund the text import.
        console.error("[scrape] branding import failed; continuing with text fields only:", err);
        return null;
      }
    });
    const { result: fields, events } = await withUsageCapture(() =>
      extractQuestionnaireFields(site)
    );
    await persistUsageEvents({
      userId: user.id,
      projectId,
      operation: "scrape_extract",
      events,
    });

    const { result: brand, events: photoEvents } = await brandTask;
    await persistUsageEvents({
      userId: user.id,
      projectId,
      operation: "image_analysis",
      events: photoEvents,
    });

    const existing = await prisma.questionnaire.findUnique({ where: { projectId } });
    const prev = existing
      ? (JSON.parse(existing.answers) as Record<string, unknown>)
      : {};
    const prevBrand = parseImportedBrand(prev.importedBrand);
    const sameSource = Boolean(
      brand && prevBrand && normalizeHttpUrl(brand.sourceUrl) === normalizeHttpUrl(prevBrand.sourceUrl)
    );
    const nextBrand = normalizeImportedBrandNotes(
      mergeImportedBrand(brand, prevBrand, sameSource)
    );
    const assetsChanged = importedAssetsChanged(prevBrand, nextBrand);
    const withoutPriorImport = { ...prev };
    for (const key of IMPORT_OVERWRITE_KEYS) delete withoutPriorImport[key];
    const next = {
      ...defaultQuestionnaire,
      ...withoutPriorImport,
      ...definedFields(fields),
      templateId: project.templateId || prev.templateId || "",
      hasWebsite: "yes",
      existingWebsiteUrl: site.url,
      importedBrand: nextBrand ?? undefined,
      importedThemeChoice: hasImportedTheme(nextBrand) ? "imported" : "custom",
      // Only clear consent when imported files actually changed.
      importedAssetConsent: assetsChanged ? undefined : prev.importedAssetConsent,
    };
    await prisma.questionnaire.upsert({
      where: { projectId },
      create: { projectId, answers: JSON.stringify(next) },
      update: { answers: JSON.stringify(next) },
    });

    return jsonOk({
      ok: true,
      fields,
      brand: hasImportedBrand(nextBrand) ? nextBrand : null,
    });
  } catch (err) {
    if (spent) {
      await refundSpend({
        userId: user.id,
        amount: cost,
        projectId,
        spendIdempotencyKey: spendKey,
      });
    }
    if (err instanceof ScrapeError) {
      const status = err.code === "INVALID_URL" || err.code === "BLOCKED_HOST" ? 400 : 422;
      return jsonError(err.message, status, err.code);
    }
    console.error("[scrape] unexpected failure:", err);
    return jsonError("We couldn't read that website.", 422, "FETCH_FAILED");
  }
}

function definedFields(fields: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out;
}

/** Previous typed answers must not leak into a new import (e.g. leftover location). */
const IMPORT_OVERWRITE_KEYS = [
  "businessName",
  "industry",
  "description",
  "location",
  "targetAudience",
  "demographics",
  "goals",
  "services",
  "contactEmail",
  "contactPhone",
] as const;

/**
 * Describes each imported photo so generation can put it where it belongs.
 * Fail-soft: without an analysis, placement falls back to the alt text.
 */
async function withPhotoAnalysis(brand: ImportedBrand, siteUrl: string): Promise<ImportedBrand> {
  if (!brand.images.length || !visionAvailable()) return brand;
  let businessName = siteUrl;
  try {
    businessName = new URL(siteUrl).hostname.replace(/^www\./, "");
  } catch {
    // Keep the raw URL as the label.
  }
  try {
    const analyses = await describePhotos(
      brand.images.map((img) => img.url),
      { businessName, industry: "the business shown on that website" },
      env.images.vision.timeoutMs
    );
    return {
      ...brand,
      images: brand.images.map((img, i) => (analyses[i] ? { ...img, analysis: analyses[i]! } : img)),
    };
  } catch (err) {
    console.warn("[scrape] photo analysis skipped:", err instanceof Error ? err.message : err);
    return brand;
  }
}

function mergeImportedBrand(
  next: ImportedBrand | null,
  previous: ImportedBrand | null,
  sameSource: boolean
): ImportedBrand | null {
  if (!next) return previous;
  if (!previous || !sameSource) return next;
  return {
    ...next,
    // If only one piece failed this run, keep the last known good assets.
    logoUrl: next.logoUrl ?? previous.logoUrl,
    images: next.images.length ? next.images : previous.images,
  };
}

function normalizeImportedBrandNotes(brand: ImportedBrand | null): ImportedBrand | null {
  if (!brand) return null;
  const notes = brand.notes.filter((note) => {
    if (brand.logoUrl && /no logo image was found/i.test(note)) return false;
    if (brand.images.length > 0 && /no photos large enough to reuse were found/i.test(note)) {
      return false;
    }
    return true;
  });
  return { ...brand, notes };
}

function importedAssetsChanged(
  previous: ImportedBrand | null,
  next: ImportedBrand | null
): boolean {
  const prevAssets = previous ? importedAssetPaths(previous).slice().sort() : [];
  const nextAssets = next ? importedAssetPaths(next).slice().sort() : [];
  if (prevAssets.length !== nextAssets.length) return true;
  for (let i = 0; i < prevAssets.length; i += 1) {
    if (prevAssets[i] !== nextAssets[i]) return true;
  }
  const prevSource = previous ? normalizeHttpUrl(previous.sourceUrl) : "";
  const nextSource = next ? normalizeHttpUrl(next.sourceUrl) : "";
  return prevSource !== nextSource;
}

function normalizeHttpUrl(value: string): string {
  try {
    return new URL(value).toString();
  } catch {
    return value.trim();
  }
}
