import { jsonError, jsonOk, readJson, requireUser } from "@/lib/http";
import { CrmScoreAction } from "@/lib/crm/config";
import { awardOneTimeAction, recordMarketingConsent } from "@/lib/crm/scoring";
import { scheduleCrmDrain } from "@/lib/crm/sync";

type Body = { marketingConsent?: unknown; mode?: unknown };

/**
 * Records the marketing-consent choice from the auth form and awards the
 * one-time registration score.
 *
 * Called right after signup or login. The score is one-time per account, so
 * existing customers pick it up on their next sign-in rather than being
 * skipped forever.
 */
export async function POST(req: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = (await readJson<Body>(req)) ?? {};
  const granted = body.marketingConsent === true;
  const mode = body.mode === "register" ? "register" : "login";

  try {
    await recordMarketingConsent({ userId: user.id, granted, mode });
    await awardOneTimeAction(user.id, CrmScoreAction.REGISTERED);
  } catch (err) {
    console.error("[crm] consent write failed:", err instanceof Error ? err.message : err);
    return jsonError("Could not save your preference.", 500, "CRM_WRITE_FAILED");
  }

  // Push to HubSpot only after the response is on its way out.
  scheduleCrmDrain();

  return jsonOk({ marketingConsent: granted });
}
