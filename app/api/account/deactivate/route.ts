import { requireUser, jsonOk, jsonError, readJson } from "@/lib/http";
import {
  deactivateAccount,
  DEACTIVATION_REASON_USER,
} from "@/lib/accounts/deactivation";

export async function POST(req: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await readJson<{ reason?: string; confirm?: boolean }>(req);
  if (body?.confirm !== true) {
    return jsonError("Confirm deactivation to continue.", 400, "CONFIRM_REQUIRED");
  }

  const reason =
    typeof body.reason === "string" && body.reason.trim()
      ? body.reason.trim()
      : DEACTIVATION_REASON_USER;

  await deactivateAccount(user.id, reason);

  return jsonOk({ deactivated: true });
}
