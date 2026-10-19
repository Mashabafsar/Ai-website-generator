"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readApiError } from "@/components/settings/read-api-error";

type BillingRow = {
  id: string;
  label: string;
  kind: string;
  amountCents: number;
  currency: string;
  status: string;
  cardBrand: string | null;
  cardLast4: string | null;
  createdAt: string;
};

const PORTAL_FAILED = "Could not open the billing portal.";

const KIND_LABEL: Record<string, string> = {
  website_package: "Website package",
  credit_pack: "Credit pack",
  invoice: "Invoice",
  payment_method: "Payment method",
};

const MANAGED_HOSTING_CODES = new Set([
  "NO_SUBSCRIPTION",
  "SUBSCRIPTION_REQUIRED",
  "MANAGED_HOSTING_REQUIRED",
  "PORTAL_UNAVAILABLE",
]);

export function BillingTab({ canUpdatePaymentMethod }: { canUpdatePaymentMethod: boolean }) {
  const [items, setItems] = useState<BillingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [portalBlocked, setPortalBlocked] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      try {
        const res = await fetch("/api/billing/history", { signal: controller.signal });
        if (!res.ok) {
          const { message } = await readApiError(res, "Could not load billing history.");
          if (active) setLoadError(message);
          return;
        }
        const data = (await res.json()) as { items?: unknown };
        if (active) setItems(toRows(data.items));
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("[settings] billing history failed:", err instanceof Error ? err.message : err);
        if (active) setLoadError("Could not load billing history.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const cardOnFile = items.find((item) => item.cardLast4) ?? null;

  async function openPortal() {
    setOpeningPortal(true);
    setPortalBlocked(false);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      if (!res.ok) {
        const { message, code } = await readApiError(res, PORTAL_FAILED);
        if (needsManagedHosting(code, message)) {
          setPortalBlocked(true);
          return;
        }
        toast.error(message);
        return;
      }
      const data = (await res.json()) as { url?: unknown };
      if (typeof data.url !== "string" || !isStripePortalUrl(data.url)) {
        toast.error(PORTAL_FAILED);
        return;
      }
      window.location.assign(data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : PORTAL_FAILED);
    } finally {
      setOpeningPortal(false);
    }
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        Card numbers stay in Stripe. This page only shows amounts, status, and a brand with the
        last four digits when we have them.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment method</CardTitle>
          <CardDescription>
            Update the card on your managed hosting subscription in Stripe&apos;s billing portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cardOnFile ? (
            <div className="inline-flex items-center gap-3 rounded-xl border bg-card px-5 py-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium capitalize">
                  {cardOnFile.cardBrand ? `${cardOnFile.cardBrand} ` : "Card "}
                  ending {cardOnFile.cardLast4}
                </div>
                <div className="text-xs text-muted-foreground">From your billing history</div>
              </div>
            </div>
          ) : null}

          {canUpdatePaymentMethod ? (
            <Button type="button" variant="brand" onClick={() => void openPortal()} disabled={openingPortal}>
              {openingPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              Update payment method
            </Button>
          ) : null}

          {!canUpdatePaymentMethod || portalBlocked ? (
            <p className="text-sm text-muted-foreground">
              You need a managed hosting subscription before you can update a payment method. We
              never collect card numbers on this page.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing history</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading billing history…</p>
          ) : loadError ? (
            <p className="text-sm text-destructive">{loadError}</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="divide-y">
              {items.map((item) => (
                <div key={`${item.kind}-${item.id}`} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {kindLabel(item.kind)}
                      {" · "}
                      {formatWhen(item.createdAt)}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <Badge variant={statusVariant(item.status)}>{formatStatus(item.status)}</Badge>
                    <span className="w-24 text-right font-semibold">
                      {formatAmount(item.amountCents, item.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function toRows(raw: unknown): BillingRow[] {
  if (!Array.isArray(raw)) return [];
  const rows: BillingRow[] = [];
  for (const entry of raw) {
    const row = toRow(entry);
    if (row) rows.push(row);
  }
  return rows;
}

function toRow(raw: unknown): BillingRow | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  if (typeof record.id !== "string") return null;
  const last4 = typeof record.cardLast4 === "string" && /^\d{4}$/.test(record.cardLast4) ? record.cardLast4 : null;
  const brand =
    typeof record.cardBrand === "string" && record.cardBrand.trim() && record.cardBrand.length <= 24
      ? record.cardBrand.trim().toLowerCase()
      : null;
  const createdAt =
    typeof record.paidAt === "string"
      ? record.paidAt
      : typeof record.createdAt === "string"
        ? record.createdAt
        : "";
  return {
    id: record.id,
    label: safeLabel(typeof record.label === "string" ? record.label : kindLabel(String(record.kind ?? ""))),
    kind: typeof record.kind === "string" ? record.kind : "payment",
    amountCents: typeof record.amountCents === "number" && Number.isFinite(record.amountCents) ? record.amountCents : 0,
    currency: typeof record.currency === "string" ? record.currency : "USD",
    status: typeof record.status === "string" ? record.status : "unknown",
    cardBrand: brand,
    cardLast4: last4,
    createdAt,
  };
}

function safeLabel(label: string): string {
  const cleaned = label.replace(/\b\d{13,19}\b/g, "••••").trim();
  return cleaned || "Payment";
}

function kindLabel(kind: string): string {
  return KIND_LABEL[kind] ?? "Payment";
}

function formatStatus(status: string): string {
  const cleaned = status.replace(/_/g, " ").toLowerCase();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function statusVariant(status: string): "success" | "warning" | "destructive" | "outline" {
  const value = status.toLowerCase();
  if (value === "paid" || value === "succeeded") return "success";
  if (value === "pending" || value === "open") return "warning";
  if (value === "failed" || value === "refunded" || value === "canceled" || value === "cancelled") {
    return "destructive";
  }
  return "outline";
}

function formatWhen(iso: string): string {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return "—";
  return new Date(time).toLocaleString();
}

function formatAmount(cents: number, currency: string): string {
  const code = /^[A-Za-z]{3}$/.test(currency) ? currency.toUpperCase() : "USD";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: code }).format(cents / 100);
  } catch (err) {
    console.error("[settings] currency format failed:", err instanceof Error ? err.message : err);
    return `${(cents / 100).toFixed(2)} ${code}`;
  }
}

function needsManagedHosting(code: string | undefined, message: string): boolean {
  if (code && MANAGED_HOSTING_CODES.has(code)) return true;
  return /managed hosting|can(?:not|'t) update/i.test(message);
}

function isStripePortalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return parsed.protocol === "https:" && (host === "stripe.com" || host.endsWith(".stripe.com"));
  } catch (err) {
    console.error("[settings] billing portal URL rejected:", err instanceof Error ? err.message : err);
    return false;
  }
}
