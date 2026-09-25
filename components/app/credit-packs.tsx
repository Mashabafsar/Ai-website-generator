"use client";

import { useState } from "react";
import { Check, Coins, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CREDIT_PACKS, type CreditPackId } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CreditPacks() {
  const [loading, setLoading] = useState<CreditPackId | null>(null);

  async function buy(packId: CreditPackId) {
    setLoading(packId);
    try {
      const res = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "We couldn't start payment");
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "We couldn't start payment. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {CREDIT_PACKS.map((pack, i) => {
        const highlight = i === 1;
        return (
          <Card
            key={pack.id}
            className={cn("relative flex flex-col", highlight && "border-2 border-primary/40 shadow-lg")}
          >
            {highlight && (
              <span className="absolute right-5 top-5 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                Popular
              </span>
            )}
            <CardContent className="flex flex-1 flex-col p-6">
              <Coins className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{pack.label}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">{pack.credits.toLocaleString()}</span>
                <span className="text-muted-foreground">credits</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">${pack.priceUsd} one-time</p>

              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> {pack.credits} credits added to your balance
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> Up to {Math.floor(pack.credits / 5)} section rewrites
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> Never expires
                </li>
              </ul>

              <Button
                variant={highlight ? "brand" : "outline"}
                className="mt-6 w-full"
                onClick={() => buy(pack.id)}
                disabled={loading !== null}
              >
                {loading === pack.id && <Loader2 className="h-4 w-4 animate-spin" />}
                Buy {pack.label}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
