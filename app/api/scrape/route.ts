import { randomUUID } from "node:crypto";
import { requireUser, jsonOk, jsonError, readJson } from "@/lib/http";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { CreditLedgerReason } from "@/lib/constants";
import { withUsageCapture } from "@/lib/ai/usage";
import { persistUsageEvents } from "@/lib/ai/usage-record";
import {
  assertAndSpend,
  refundSpend,
  InsufficientCreditsError,
} from "@/lib/credits/credits";
import {
  fetchAndParseWebsite,
  extractQuestionnaireFields,
  ScrapeError,
} from "@/lib/scraper/website";
import { importBrandFromSite } from "@/lib/scraper/brand";
import { getOwnedProject } from "@/lib/projects/projects";
import { defaultQuestionnaire } from "@/lib/questionnaire/schema";
import { hasImportedBrand, hasImportedTheme } from "@/lib/branding/imported-brand";

// Website Import — scrapes a customer's existing site and maps it to
// questionnaire fields, then pulls logo / photos / colours / typeface.
// Importing costs credits (default 10); the charge is refunded if the site
// can't be read. Branding/asset failures are fail-soft — the customer still
// keeps the text prefill. Token usage still lands in the admin ledger as `scrape_extract`.

export const maxDuration = 60;

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
    return jsonError("Missing project.", 400, "INVALID_PROJECT");
  }

  const project = await getOwnedProject(user.id, projectId);
  if (!project) return jsonError("Project not found", 404, "NOT_FOUND");

  const cost = env.credits.costScrapeImport;
  const spendKey = `scrape_import:${user.id}:${randomUUID()}`;

  try {
    await assertAndSpend({
      userId: user.id,
      amount: cost,
      reason: CreditLedgerReason.SCRAPE_IMPORT,
      idempotencyKey: spendKey,
    });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return jsonError(
        "Not enough credits to import a website. Please top up.",
        402,
        "INSUFFICIENT_CREDITS",
        { required: err.required, available: err.available }
      );
    }
    throw err;
  }

  try {
    const site = await fetchAndParseWebsite(url);
    const { result: fields, events } = await withUsageCapture(() =>
      extractQuestionnaireFields(site)
    );
    await persistUsageEvents({ userId: user.id, operation: "scrape_extract", events });

    let brand: Awaited<ReturnType<typeof importBrandFromSite>> | null = null;
    try {
      brand = await importBrandFromSite({ projectId, site });
    } catch (err) {
      // A bad logo / photo / theme pass must not refund the text import.
      console.error("[scrape] branding import failed; continuing with text fields only:", err);
    }

    const existing = await prisma.questionnaire.findUnique({ where: { projectId } });
    const prev = existing
      ? (JSON.parse(existing.answers) as Record<string, unknown>)
      : {};
    const next = {
      ...defaultQuestionnaire,
      ...prev,
      ...definedFields(fields),
      templateId: project.templateId || prev.templateId || "",
      hasWebsite: "yes",
      existingWebsiteUrl: site.url,
      importedBrand: brand ?? undefined,
      importedThemeChoice: hasImportedTheme(brand) ? "imported" : "custom",
      // A new download invalidates the previous yes — the files changed.
      importedAssetConsent: undefined,
    };
    await prisma.questionnaire.upsert({
      where: { projectId },
      create: { projectId, answers: JSON.stringify(next) },
      update: { answers: JSON.stringify(next) },
    });

    return jsonOk({
      ok: true,
      fields,
      brand: hasImportedBrand(brand) ? brand : null,
    });
  } catch (err) {
    await refundSpend({ userId: user.id, amount: cost, spendIdempotencyKey: spendKey });
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
