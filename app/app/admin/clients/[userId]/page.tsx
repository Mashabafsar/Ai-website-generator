import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/admin";
import { getClientDetail } from "@/lib/crm/admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin · Client" };

function fmtDate(value: Date | null) {
  return value ? value.toLocaleString() : "—";
}

function money(amount: number, currency = "USD") {
  return `${amount} ${currency.toUpperCase()}`;
}

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");
  if (!(await isAdmin(session.user.id, session.user.email))) notFound();

  const { userId } = await params;
  const client = await getClientDetail(userId);
  if (!client) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/app/admin/clients" className="text-sm text-primary hover:underline">
          All clients
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
          {client.name || client.email}
        </h1>
        <p className="mt-1 text-muted-foreground">{client.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Registered" value={fmtDate(client.createdAt)} />
        <Stat label="Lead score" value={String(client.leadScore)} />
        <Stat
          label="Marketing consent"
          value={client.marketingConsent ? "Opted in" : "Not opted in"}
        />
        <Stat
          label="Consent given"
          value={fmtDate(client.marketingConsentAt)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">HubSpot sync</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Contact ID" value={client.hubspotContactId ?? "—"} />
          <Row
            label="Deal IDs"
            value={
              client.websitePurchases
                .map((p) => p.hubspotDealId)
                .filter(Boolean)
                .join(", ") || "—"
            }
          />
          <Row label="Last synced" value={fmtDate(client.hubspotLastSyncedAt)} />
          <div className="flex items-start justify-between gap-4">
            <span className="text-muted-foreground">Last error</span>
            {client.hubspotLastError ? (
              <span className="max-w-[70%] text-right text-error-main">
                {client.hubspotLastError}
              </span>
            ) : (
              <span>—</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Score history</CardTitle>
        </CardHeader>
        <CardContent>
          {client.scoreEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scoring events yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">When</th>
                  <th className="py-2 pr-4 font-medium">Action</th>
                  <th className="py-2 text-right font-medium">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {client.scoreEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="py-2.5 pr-4 whitespace-nowrap text-muted-foreground">
                      {fmtDate(event.createdAt)}
                    </td>
                    <td className="py-2.5 pr-4">{event.label}</td>
                    <td className="py-2.5 text-right tabular-nums">+{event.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Credit packages</CardTitle>
        </CardHeader>
        <CardContent>
          {client.creditPurchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No credit packs purchased.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">When</th>
                  <th className="py-2 pr-4 font-medium">Package</th>
                  <th className="py-2 pr-4 text-right font-medium">Credits</th>
                  <th className="py-2 text-right font-medium">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {client.creditPurchases.map((pack) => (
                  <tr key={pack.id}>
                    <td className="py-2.5 pr-4 whitespace-nowrap text-muted-foreground">
                      {fmtDate(pack.createdAt)}
                    </td>
                    <td className="py-2.5 pr-4">{pack.packLabel}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">{pack.credits}</td>
                    <td className="py-2.5 text-right tabular-nums">
                      {pack.priceUsd != null ? money(pack.priceUsd) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Websites purchased</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {client.websitePurchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No website package paid yet.</p>
          ) : (
            client.websitePurchases.map((purchase) => (
              <div key={purchase.id} className="space-y-2 border-b pb-5 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <a
                    href={purchase.websiteUrl}
                    className="font-medium text-primary hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {purchase.websiteUrl}
                  </a>
                  <span className="tabular-nums">{money(purchase.price, purchase.currency)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{fmtDate(purchase.createdAt)}</p>
                {purchase.breakdown.length > 0 && (
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {purchase.breakdown.map((line, i) => (
                      <li key={`${purchase.id}-${i}`} className="flex justify-between gap-4">
                        <span>{line.name}</span>
                        <span className="tabular-nums">{money(line.amount, purchase.currency)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {purchase.hubspotDealId && (
                  <Badge variant="outline">Deal {purchase.hubspotDealId}</Badge>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 font-display text-lg font-semibold leading-snug">{value}</div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[70%] text-right break-all">{value}</span>
    </div>
  );
}
