"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coins } from "lucide-react";
import { UserMenu } from "@/components/app/user-menu";
import { CREDITS_CHANGED_EVENT } from "@/lib/credits/notify";
import { useGenerationLock } from "@/components/app/generation-lock";
import { cn } from "@/lib/utils";

// App shell top bar — 95px #f4f4f4 strip from the sidebar study. Page title on
// the left; token balance and the account menu on the right.

const TITLES: [RegExp, string][] = [
  [/^\/app\/dashboard/, "Dashboard"],
  [/^\/app\/settings/, "Settings"],
  [/^\/app\/templates/, "Templates"],
  [/^\/app\/credits/, "Credits"],
  [/^\/app\/new-project/, "New Website"],
  [/^\/app\/project\/[^/]+\/editor/, "Editor"],
  [/^\/app\/project\/[^/]+\/questionnaire/, "Your business"],
  [/^\/app\/project\/[^/]+\/quote/, "Quote"],
  [/^\/app\/project\/[^/]+\/deployment/, "Deliver"],
  [/^\/app\/project\/[^/]+\/preview/, "Preview"],
  [/^\/app\/project/, "Project"],
  [/^\/app\/admin\/clients/, "Clients"],
  [/^\/app\/admin\/usage/, "Usage"],
  [/^\/app\/admin/, "Admin"],
];

function titleFor(pathname: string): string {
  for (const [re, title] of TITLES) if (re.test(pathname)) return title;
  return "Dashboard";
}

function Divider() {
  return <span aria-hidden className="h-[95px] w-px bg-line" />;
}

export function AppTopbar({
  user,
  balance: initialBalance,
}: {
  user: { name: string; email: string };
  balance: number;
}) {
  const pathname = usePathname();
  const [balance, setBalance] = useState(initialBalance);
  const { locked, warnStay } = useGenerationLock();

  useEffect(() => {
    setBalance(initialBalance);
  }, [initialBalance]);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      try {
        const res = await fetch("/api/credits/balance", { cache: "no-store" });
        const data = (await res.json()) as { balance?: unknown };
        if (!cancelled && typeof data.balance === "number") setBalance(data.balance);
      } catch (err) {
        console.error(
          "[credits] balance refresh failed:",
          err instanceof Error ? err.message : err
        );
      }
    }
    void refresh();
    const onChanged = () => {
      void refresh();
    };
    const onVis = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener(CREDITS_CHANGED_EVENT, onChanged);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      window.removeEventListener(CREDITS_CHANGED_EVENT, onChanged);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-[95px] items-center justify-between bg-[#f4f4f4] pl-[30px]">
      <h1 className="text-lg font-medium leading-[1.2] text-black">{titleFor(pathname)}</h1>

      <div className="flex items-center gap-5 pr-6">
        <Divider />
        {locked ? (
          <button
            type="button"
            onClick={warnStay}
            aria-disabled="true"
            title="Credits are paused while your website is being created"
            className={cn(
              "flex items-center gap-3.5 text-black",
              "cursor-not-allowed opacity-60"
            )}
          >
            <Coins className="size-[26px] text-brand-blue" />
            <span className="text-lg leading-[1.2]">{balance.toLocaleString()} Credits left</span>
          </button>
        ) : (
          <Link
            href="/app/credits"
            className="flex items-center gap-3.5 text-black transition-opacity hover:opacity-70"
            title="Credits — click to buy more"
          >
            <Coins className="size-[26px] text-brand-blue" />
            <span className="text-lg leading-[1.2]">{balance.toLocaleString()} Credits left</span>
          </Link>
        )}
        <Divider />
        <UserMenu name={user.name} email={user.email} navigationLocked={locked} onBlocked={warnStay} />
      </div>
    </header>
  );
}
