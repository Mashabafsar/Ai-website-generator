"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HostingChoiceDialog } from "@/components/app/hosting-choice-dialog";
import { formatCurrency } from "@/lib/utils";
import { PackageType, type PackageType as PackageTypeValue } from "@/lib/constants";

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
  const [hostingOpen, setHostingOpen] = useState(false);
  const [hostingIntent, setHostingIntent] = useState<"quote" | "checkout">("checkout");

  async function applyPackage(packageType: PackageTypeValue): Promise<Quote | null> {
    const res = await fetch(`/api/projects/${projectId}/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "We couldn't calculate the price");
    setQuote(data);
    router.refresh();
    return data as Quote;
  }

  async function recalc() {
    setHostingIntent("quote");
    setHostingOpen(true);
  }

  async function checkout() {
    setHostingIntent("checkout");
    setHostingOpen(true);
  }

  async function confirmHosting(packageType: PackageTypeValue) {
    const paying = hostingIntent === "checkout";
    if (paying) setCheckingOut(true);
    else setCalculating(true);
    try {
      await applyPackage(packageType);
      if (!paying) {
        toast.success("Quote updated");
        setHostingOpen(false);
        return;
      }
      const res = await fetch("/api/checkout/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, packageType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "We couldn't start payment");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : paying
            ? "We couldn't start payment. Please try again."
            : "We couldn't update your quote. Please try again."
      );
      setCheckingOut(false);
    } finally {
      setCalculating(false);
    }
  }

  const isManaged = quote?.packageType === PackageType.MANAGED_HOSTING;
  const submitting = calculating || checkingOut;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Your quote</h2>
            <p className="text-sm text-muted-foreground">
              {quote
                ? isManaged
                  ? "We host it for you"
                  : "Download your files"
                : "Choose how you'll get your site to see the price"}
            </p>
          </div>
          {!isPaid && (
            <Button variant="outline" size="sm" onClick={recalc} disabled={submitting}>
              {calculating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {quote ? "Change how you get it" : "See the price"}
            </Button>
          )}
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
            Choose whether you'll download the files or we'll put the site online.
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
              className="mt-5 w-full active:scale-[0.98]"
              onClick={checkout}
              disabled={checkingOut}
            >
              {checkingOut && <Loader2 className="h-4 w-4 animate-spin" />}
              Continue to payment
            </Button>
          )}
        </div>

        <p className="px-1 text-xs text-muted-foreground">
          {isManaged
            ? "After you pay, we put the site online and host it for you."
            : "After you pay, you can download your website files and upload them anywhere."}{" "}
          Pick how you'll get the site just before payment — the price updates to match.
        </p>
      </div>

      <HostingChoiceDialog
        open={hostingOpen}
        onOpenChange={setHostingOpen}
        initialPackage={quote?.packageType}
        submitting={submitting}
        confirmLabel={hostingIntent === "checkout" ? "Continue to payment" : "Update quote"}
        onConfirm={confirmHosting}
      />
    </div>
  );
}
