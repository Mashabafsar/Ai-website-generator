import { jsonOk, requireAdmin } from "@/lib/http";
import { listClients, parseClientListQuery } from "@/lib/crm/admin";

export async function GET(req: Request) {
  const { user, response } = await requireAdmin();
  if (!user) return response;

  const query = parseClientListQuery(new URL(req.url).searchParams);
  const result = await listClients(query);
  return jsonOk(result);
}
