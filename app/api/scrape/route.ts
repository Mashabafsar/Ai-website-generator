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

// Website Import — scrapes a customer's existing site and maps it to
// questionnaire fields. Importing costs credits (default 10); the charge is
// refunded if the site can't be read. Token usage still lands in the admin
// ledger as `scrape_extract`.

type Body = { url?: string };

export async function POST(req: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await readJson<Body>(req);
  const url = (body?.url || "").trim();
  if (!url) {
    return jsonError("Enter a website URL.", 400, "INVALID_URL");
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
    const { result: fields, events } = await withUsageCapture(() =>
      extractQuestionnaireFields(site)
    );
    await persistUsageEvents({ userId: user.id, operation: "scrape_extract", events });
    return jsonOk({ ok: true, fields });
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
