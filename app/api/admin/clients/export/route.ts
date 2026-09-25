import { requireAdmin } from "@/lib/http";
import { clientsToCsv, listClientsForExport, parseClientListQuery } from "@/lib/crm/admin";

export async function GET(req: Request) {
  const { user, response } = await requireAdmin();
  if (!user) return response;

  const query = parseClientListQuery(new URL(req.url).searchParams);
  const rows = await listClientsForExport(query);
  const csv = clientsToCsv(rows);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="clients-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
