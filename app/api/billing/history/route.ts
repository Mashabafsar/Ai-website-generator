import { requireUser, jsonOk } from "@/lib/http";
import { listBillingHistory } from "@/lib/billing/records";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const items = await listBillingHistory(user.id);
  return jsonOk({ items });
}
