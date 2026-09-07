import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertTriangle, Coins, Cpu, Gauge, Sparkles, Wrench } from "lucide-react";
import { getCurrentSession } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { FAILURE_LABEL, TEMPLATE_FALLBACK, isPermanent, type AiFailureKind } from "@/lib/ai/failure";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Admin · AI usage" };

const OPERATION_LABEL: Record<string, string> = {
  heavy_generate: "Website generation",
  light_edit: "AI section edit",
  scrape_extract: "Website import",
};

const fmt = (n: number | null | undefined) => (n ?? 0).toLocaleString();

const DAY_MS = 24 * 60 * 60 * 1000;

const kindLabel = (kind: string) =>
  FAILURE_LABEL[kind as AiFailureKind] ?? kind.replace(/_/g, " ");

export default async function AdminUsagePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");
  if (!(await isAdmin(session.user.id, session.user.email))) notFound();

  const { kind: kindFilter } = await searchParams;
  const since = new Date(Date.now() - 7 * DAY_MS);

  const [
    rows,
    totals,
    byOperation,
    byProvider,
    generateCount,
    incidents,
    byKind,
    fallbackTotal,
    recentFallbacks,
    openMisconfigurations,
  ] = await Promise.all([
    prisma.aiUsage.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { email: true } } },
    }),
    prisma.aiUsage.aggregate({
      _sum: { totalTokens: true, promptTokens: true, completionTokens: true },
      _count: true,
    }),
    prisma.aiUsage.groupBy({
      by: ["operation"],
      _sum: { totalTokens: true },
      _count: true,
    }),
    prisma.aiUsage.groupBy({
      by: ["provider"],
      _sum: { totalTokens: true },
      _count: true,
    }),
    prisma.aiUsage.count({ where: { operation: "heavy_generate" } }),
    prisma.aiIncident.findMany({
      where: kindFilter ? { kind: kindFilter } : undefined,
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    prisma.aiIncident.groupBy({
      by: ["kind"],
      where: { createdAt: { gte: since } },
      _count: true,
    }),
    prisma.aiIncident.count({ where: { kind: TEMPLATE_FALLBACK } }),
    prisma.aiIncident.count({
      where: { kind: TEMPLATE_FALLBACK, createdAt: { gte: new Date(Date.now() - DAY_MS) } },
    }),
    prisma.aiIncident.findMany({
      where: {
        kind: { in: ["configuration", "auth"] },
        createdAt: { gte: new Date(Date.now() - DAY_MS) },
      },
      orderBy: { createdAt: "desc" },
      distinct: ["provider", "model", "kind"],
      take: 5,
    }),
  ]);

  const totalTokens = totals._sum.totalTokens ?? 0;
  const avgPerGenerate = generateCount > 0 ? Math.round(totalTokens / generateCount) : 0;
  const failureKinds = byKind.filter((k) => k.kind !== TEMPLATE_FALLBACK);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">AI usage ledger</h1>
        <p className="mt-1 text-muted-foreground">
          Real LLM token consumption per generation and edit. Credits are a fixed
          price; this shows the underlying model cost.
        </p>
      </div>

      {(recentFallbacks > 0 || openMisconfigurations.length > 0) && (
        <div className="border border-error-border bg-error-surface p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-error-main" />
            <div className="space-y-2">
              <p className="font-semibold">Generation is degraded</p>
              {recentFallbacks > 0 && (
                <p className="text-sm text-ink-soft">
                  {fmt(recentFallbacks)} build{recentFallbacks === 1 ? "" : "s"} in the last
                  24 hours were written by the deterministic template because no model
                  answered. Those generations were refunded, not billed.
                </p>
              )}
              {openMisconfigurations.map((m) => (
                <p key={m.id} className="text-sm text-ink-soft">
                  <span className="font-semibold">
                    {m.provider} · {m.model || "(no model)"}
                  </span>{" "}
                  is out of the chain — {kindLabel(m.kind).toLowerCase()}. {m.message}
                  {m.detail ? ` Accepted values: ${m.detail}` : ""}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={<Cpu className="h-5 w-5 text-primary" />} label="Total tokens" value={fmt(totalTokens)} />
        <StatCard
          icon={<Gauge className="h-5 w-5 text-primary" />}
          label="Avg tokens / generation"
          value={fmt(avgPerGenerate)}
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5 text-primary" />}
          label="Generations"
          value={fmt(generateCount)}
        />
        <StatCard
          icon={<Coins className="h-5 w-5 text-primary" />}
          label="Total AI calls"
          value={fmt(totals._count)}
        />
        <StatCard
          icon={
            <Wrench
              className={`h-5 w-5 ${fallbackTotal > 0 ? "text-error-main" : "text-primary"}`}
            />
          }
          label="Template fallbacks"
          value={fmt(fallbackTotal)}
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Provider failures (last 7 days)</CardTitle>
          {kindFilter && (
            <Link href="/app/admin/usage" className="text-sm text-primary hover:underline">
              Clear filter
            </Link>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {failureKinds.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No provider failures recorded in the last 7 days.
            </p>
          ) : (
            failureKinds.map((k) => (
              <div key={k.kind} className="flex items-center justify-between text-sm">
                <Link
                  href={`/app/admin/usage?kind=${encodeURIComponent(k.kind)}`}
                  className="hover:underline"
                >
                  {kindLabel(k.kind)}
                  {isPermanent(k.kind as AiFailureKind) && (
                    <Badge variant="destructive" className="ml-2">
                      needs a fix
                    </Badge>
                  )}
                </Link>
                <span className="font-semibold tabular-nums">{fmt(k._count)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {kindFilter
              ? `Incidents: ${kindLabel(kindFilter)}`
              : "Recent provider incidents (latest 60)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No failures or template fallbacks recorded.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="w-[17%] py-2 pr-4 font-medium">When</th>
                    <th className="w-[13%] py-2 pr-4 font-medium">Operation</th>
                    <th className="w-[17%] py-2 pr-4 font-medium">Provider / model</th>
                    <th className="w-[14%] py-2 pr-4 font-medium">Problem</th>
                    <th className="py-2 font-medium">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {incidents.map((i) => (
                    <tr key={i.id}>
                      <td className="py-2.5 pr-4 whitespace-nowrap text-muted-foreground">
                        {new Date(i.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-4">
                        {OPERATION_LABEL[i.operation] ?? i.operation}
                      </td>
                      <td className="py-2.5 pr-4 break-words">
                        <span className="font-medium">{i.provider}</span>
                        {i.model && <span className="text-muted-foreground"> · {i.model}</span>}
                      </td>
                      <td className="py-2.5 pr-4 whitespace-nowrap">
                        <Badge
                          variant={
                            i.kind === TEMPLATE_FALLBACK ||
                            isPermanent(i.kind as AiFailureKind)
                              ? "destructive"
                              : "warning"
                          }
                        >
                          {kindLabel(i.kind)}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-muted-foreground">
                        <div className="line-clamp-3 break-words">
                          {i.message}
                          {i.detail ? ` — accepted: ${i.detail}` : ""}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By operation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {byOperation.length === 0 ? (
              <p className="text-sm text-muted-foreground">No usage yet.</p>
            ) : (
              byOperation.map((o) => (
                <Row
                  key={o.operation}
                  label={OPERATION_LABEL[o.operation] ?? o.operation}
                  count={o._count}
                  tokens={o._sum.totalTokens ?? 0}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">By provider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {byProvider.length === 0 ? (
              <p className="text-sm text-muted-foreground">No usage yet.</p>
            ) : (
              byProvider.map((p) => (
                <Row
                  key={p.provider}
                  label={p.provider}
                  count={p._count}
                  tokens={p._sum.totalTokens ?? 0}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent AI calls (latest 200)</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No AI usage recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">When</th>
                    <th className="py-2 pr-4 font-medium">User</th>
                    <th className="py-2 pr-4 font-medium">Operation</th>
                    <th className="py-2 pr-4 font-medium">Provider / model</th>
                    <th className="py-2 pr-4 text-right font-medium">Prompt</th>
                    <th className="py-2 pr-4 text-right font-medium">Output</th>
                    <th className="py-2 pr-4 text-right font-medium">Total</th>
                    <th className="py-2 font-medium">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2.5 pr-4 whitespace-nowrap text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-4 whitespace-nowrap">{r.user?.email ?? "—"}</td>
                      <td className="py-2.5 pr-4 whitespace-nowrap">
                        {OPERATION_LABEL[r.operation] ?? r.operation}
                      </td>
                      <td className="py-2.5 pr-4 whitespace-nowrap">
                        <span className="font-medium">{r.provider}</span>
                        <span className="text-muted-foreground"> · {r.model}</span>
                      </td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">{fmt(r.promptTokens)}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">{fmt(r.completionTokens)}</td>
                      <td className="py-2.5 pr-4 text-right font-semibold tabular-nums">{fmt(r.totalTokens)}</td>
                      <td className="py-2.5">
                        <Badge variant={r.estimated ? "outline" : "secondary"}>
                          {r.estimated ? "estimated" : "measured"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">{icon}</div>
        <div>
          <div className="font-display text-2xl font-bold leading-none tabular-nums">{value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, count, tokens }: { label: string; count: number; tokens: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="capitalize">{label}</span>
      <span className="flex items-center gap-4">
        <span className="text-muted-foreground">{fmt(count)} calls</span>
        <span className="w-24 text-right font-semibold tabular-nums">{fmt(tokens)}</span>
      </span>
    </div>
  );
}
