import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Coins } from "lucide-react";
import { getCurrentUserId } from "@/lib/auth/session";
import { getBalance } from "@/lib/credits/credits";
import { prisma } from "@/lib/prisma";
import { CreditPacks } from "@/components/app/credit-packs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PurchaseToast } from "@/components/app/purchase-toast";

export const metadata: Metadata = { title: "Credits" };

const REASON_LABEL: Record<string, string> = {
  SIGNUP_BONUS: "Signup bonus",
  PURCHASE: "Credit purchase",
  HEAVY_GENERATE: "Website generation",
  LIGHT_EDIT: "AI section edit",
  REFUND: "Refund",
  ADJUSTMENT: "Adjustment",
};

export default async function CreditsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const [balance, entries] = await Promise.all([
    getBalance(userId),
    prisma.creditLedger.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <PurchaseToast />
      </Suspense>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Credits</h1>
          <p className="mt-1 text-muted-foreground">
            Credits power AI generation and edits. Buy more anytime.
          </p>
        </div>
        <div className="inline-flex items-center gap-3 rounded-xl border bg-card px-5 py-3">
          <Coins className="h-6 w-6 text-primary" />
          <div>
            <div className="font-display text-2xl font-bold leading-none">
              {balance.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">available credits</div>
          </div>
        </div>
      </div>

      <CreditPacks />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaction history</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="divide-y">
              {entries.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <div className="font-medium">{REASON_LABEL[e.reason] ?? e.reason}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(e.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span
                      className={
                        e.amount >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-foreground"
                      }
                    >
                      {e.amount >= 0 ? "+" : ""}
                      {e.amount}
                    </span>
                    <span className="w-16 text-right text-muted-foreground">{e.balanceAfter}</span>
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
