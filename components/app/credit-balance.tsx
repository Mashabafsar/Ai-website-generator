import Link from "next/link";
import { Coins, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function CreditBalance({ balance, className }: { balance: number; className?: string }) {
  const low = balance < 50;
  return (
    <Link
      href="/app/credits"
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary",
        low ? "border-amber-300 bg-amber-50 text-amber-700" : "border-border bg-card",
        className
      )}
      title="Credits — click to top up"
    >
      <Coins className={cn("h-4 w-4", low ? "text-amber-600" : "text-primary")} />
      <span>{balance.toLocaleString()}</span>
      <span className="text-muted-foreground">credits</span>
      <Plus className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:rotate-90" />
    </Link>
  );
}
