import { requireUser, jsonOk, jsonError, readJson } from "@/lib/http";
import { withUsageCapture } from "@/lib/ai/usage";
import { persistUsageEvents } from "@/lib/ai/usage-record";
import {
  fetchAndParseWebsite,
  extractQuestionnaireFields,
  ScrapeError,
} from "@/lib/scraper/website";

// Website Import — scrapes a customer's existing site and maps it to
// questionnaire fields. Prefill-only: it never touches credits, the
// questionnaire row, or project state; saving stays with the questionnaire POST.

type Body = { url?: string };

export async function POST(req: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await readJson<Body>(req);
  const url = (body?.url || "").trim();
  if (!url) {
    return jsonError("Enter a website URL.", 400, "INVALID_URL");
  }

  try {
    const site = await fetchAndParseWebsite(url);
    const { result: fields, events } = await withUsageCapture(() =>
      extractQuestionnaireFields(site)
    );
    // Ledger only — the import is free for the customer.
    await persistUsageEvents({ userId: user.id, operation: "scrape_extract", events });
    return jsonOk({ ok: true, fields });
  } catch (err) {
    if (err instanceof ScrapeError) {
      const status = err.code === "INVALID_URL" || err.code === "BLOCKED_HOST" ? 400 : 422;
      return jsonError(err.message, status, err.code);
    }
    console.error("[scrape] unexpected failure:", err);
    return jsonError("We couldn't read that website.", 422, "FETCH_FAILED");
  }
}
