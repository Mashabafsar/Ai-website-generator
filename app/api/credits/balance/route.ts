import { requireUser, jsonOk } from "@/lib/http";
import { getBalance } from "@/lib/credits/credits";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const balance = await getBalance(user.id);
  return jsonOk({ balance });
}
