"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { PackageType } from "@/lib/constants";

type QuoteLineItem = { name: string; amount: number };
type Quote = {
  packageType: string;
  oneTimeTotal: number;
  monthlyTotal: number;
  currency: string;
  lineItems: QuoteLineItem[];
};

export function QuotePanel({
  projectId,
  initialQuote,
  isPaid,
}: {
  projectId: string;
  initialQuote: Quote | null;
  isPaid: boolean;
}) {
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(initialQuote);
  const [calculating, setCalculating] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  async function recalc() {
    setCalculating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/quote`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not calculate quote");
      setQuote(data);
      toast.success("Quote updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Quote failed");
    } finally {
      setCalculating(false);
    }
  }

  async function checkout() {
    setCheckingOut(true);
    try {
      const res = await fetch("/api/checkout/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start checkout");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
      setCheckingOut(false);
    }
  }

  const isManaged = quote?.packageType === PackageType.MANAGED_HOSTING;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Your quote</h2>
            <p className="text-sm text-muted-foreground">
              {isManaged ? "Managed hosting + subdomain" : "Self-hosting (ZIP export)"}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={recalc} disabled={calculating}>
            {calculating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Recalculate
          </Button>
        </div>

        {quote ? (
          <ul className="divide-y">
            {quote.lineItems.map((li, i) => (
              <li key={i} className="flex items-center justify-between px-6 py-3 text-sm">
                <span>{li.name}</span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(li.amount, quote.currency)}
                  {li.name.toLowerCase().includes("monthly") ? "/mo" : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            No quote yet. Click “Recalculate” to generate one from your website.
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-6">
          <div className="text-sm text-muted-foreground">One-time total</div>
          <div className="font-display text-3xl font-bold">
            {quote ? formatCurrency(quote.oneTimeTotal, quote.currency) : "—"}
          </div>
          {quote && quote.monthlyTotal > 0 && (
            <div className="mt-1 text-sm text-muted-foreground">
              + {formatCurrency(quote.monthlyTotal, quote.currency)}/mo hosting
            </div>
          )}

          {isPaid ? (
            <div className="mt-5 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
              <ShieldCheck className="h-4 w-4" /> Payment complete
            </div>
          ) : (
            <Button
              variant="brand"
              className="mt-5 w-full"
              onClick={checkout}
              disabled={checkingOut || !quote}
            >
              {checkingOut && <Loader2 className="h-4 w-4 animate-spin" />}
              Continue to payment
            </Button>
          )}
        </div>

        <p className="px-1 text-xs text-muted-foreground">
          {isManaged
            ? "Payment unlocks a live deployment on your subdomain."
            : "Payment unlocks a downloadable ZIP of your full source code."}{" "}
          Your project and GitHub backup are always saved regardless of payment.
        </p>
      </div>
    </div>
  );
}
