import { randomUUID } from "node:crypto";
import { requireUser, jsonOk, jsonError, readJson } from "@/lib/http";
import { env } from "@/lib/env";
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

// Website Import — scrapes a customer's existing site and maps it to
// questionnaire fields, and pulls their logo, photos, colours, and typeface.
// Importing costs credits (default 10); the charge is refunded if the site
// can't be read. Token usage still lands in the admin ledger as
// `scrape_extract`. The branding pass adds no model calls — only bounded,
// SSRF-guarded asset downloads — so it does not change the price.

type Body = { url?: string; projectId?: string };

export async function POST(req: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await readJson<Body>(req);
  const url = (body?.url || "").trim();
  if (!url) {
    return jsonError("Enter a website URL.", 400, "INVALID_URL");
  }

  // Downloaded assets are written into the project's own upload folder, so the
  // caller must own the project they name. Without one, only text is imported.
  let projectId: string | null = null;
  if (body?.projectId) {
    const project = await getOwnedProject(user.id, body.projectId);
    if (!project) return jsonError("Project not found", 404, "NOT_FOUND");
    projectId = project.id;
  }

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

    // Text extraction and asset downloads are independent; branding failures
    // must never cost the customer their prefill.
    const [{ result: fields, events }, brand] = await Promise.all([
      withUsageCapture(() => extractQuestionnaireFields(site)),
      projectId
        ? importBrandFromSite({ projectId, site }).catch((err) => {
            console.error("[scrape] brand import failed:", err);
            return null;
          })
        : Promise.resolve(null),
    ]);

    await persistUsageEvents({ userId: user.id, operation: "scrape_extract", events });
    return jsonOk({ ok: true, fields, brand });
  } catch (err) {
    // The import failed — the customer gets their credits back.
    await refundSpend({ userId: user.id, amount: cost, spendIdempotencyKey: spendKey });
    if (err instanceof ScrapeError) {
      const status = err.code === "INVALID_URL" || err.code === "BLOCKED_HOST" ? 400 : 422;
      return jsonError(err.message, status, err.code);
    }
    console.error("[scrape] unexpected failure:", err);
    return jsonError("We couldn't read that website.", 422, "FETCH_FAILED");
  }
}
