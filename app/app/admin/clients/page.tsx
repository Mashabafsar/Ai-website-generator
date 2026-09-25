import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/admin";
import {
  clientListSearchParams,
  listClients,
  parseClientListQuery,
} from "@/lib/crm/admin";
import { ClientsFilters } from "@/components/admin/clients-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin · Clients" };

function fmtDate(value: Date | null) {
  return value ? value.toLocaleString() : "—";
}

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");
  if (!(await isAdmin(session.user.id, session.user.email))) notFound();

  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") params.set(key, value);
  }
  const query = parseClientListQuery(params);
  const { rows, total, page, pageCount } = await listClients(query);
  const exportQs = clientListSearchParams(query).toString();
  const prevHref = `/app/admin/clients?${clientListSearchParams(query, { page: page - 1 }).toString()}`;
  const nextHref = `/app/admin/clients?${clientListSearchParams(query, { page: page + 1 }).toString()}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Clients</h1>
          <p className="mt-1 text-muted-foreground">
            Lead scores, marketing consent, and HubSpot sync status. Read-only.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href={`/api/admin/clients/export${exportQs ? `?${exportQs}` : ""}`}>
            Export CSV
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Find accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientsFilters query={query} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">
            {total === 0 ? "No clients match" : `${total} client${total === 1 ? "" : "s"}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No accounts match this search. Clear the filters to see everyone.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Email</th>
                    <th className="py-2 pr-4 font-medium">Registered</th>
                    <th className="py-2 pr-4 text-right font-medium">Score</th>
                    <th className="py-2 pr-4 font-medium">Consent</th>
                    <th className="py-2 font-medium">HubSpot</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-2.5 pr-4">
                        <Link
                          href={`/app/admin/clients/${row.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {row.name || "—"}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 whitespace-nowrap">{row.email}</td>
                      <td className="py-2.5 pr-4 whitespace-nowrap text-muted-foreground">
                        {fmtDate(row.createdAt)}
                      </td>
                      <td className="py-2.5 pr-4 text-right font-semibold tabular-nums">
                        {row.leadScore}
                      </td>
                      <td className="py-2.5 pr-4">
                        <Badge variant={row.marketingConsent ? "secondary" : "outline"}>
                          {row.marketingConsent ? "Opted in" : "No"}
                        </Badge>
                      </td>
                      <td className="py-2.5">
                        {row.hubspotLastError ? (
                          <span className="text-error-main">Error</span>
                        ) : row.hubspotContactId ? (
                          <span className="text-muted-foreground">
                            Synced {fmtDate(row.hubspotLastSyncedAt)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Not synced</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pageCount > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Page {page} of {pageCount}
              </p>
              <div className="flex gap-2">
                {page > 1 ? (
                  <Link href={prevHref} className="text-primary hover:underline">
                    Previous
                  </Link>
                ) : (
                  <span className="text-muted-foreground">Previous</span>
                )}
                {page < pageCount ? (
                  <Link href={nextHref} className="text-primary hover:underline">
                    Next
                  </Link>
                ) : (
                  <span className="text-muted-foreground">Next</span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
