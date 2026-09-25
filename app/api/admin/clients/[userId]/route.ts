import { jsonError, jsonOk, requireAdmin } from "@/lib/http";
import { getClientDetail } from "@/lib/crm/admin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { user, response } = await requireAdmin();
  if (!user) return response;

  const { userId } = await params;
  const detail = await getClientDetail(userId);
  if (!detail) return jsonError("Not found.", 404, "NOT_FOUND");
  return jsonOk(detail);
}
