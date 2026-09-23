"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coins } from "lucide-react";
import { UserMenu } from "@/components/app/user-menu";
import { CREDITS_CHANGED_EVENT } from "@/lib/credits/notify";

// App shell top bar — 66px white bar with a hairline bottom border: page title
// on the left; token balance, theme toggle, and the account menu on the right,
// separated by vertical hairlines (per the dashboard design).

const TITLES: [RegExp, string][] = [
  [/^\/app\/dashboard/, "Dashboard"],
  [/^\/app\/templates/, "Templates"],
  [/^\/app\/credits/, "Credits"],
  [/^\/app\/new-project/, "New Website"],
  [/^\/app\/project\/[^/]+\/editor/, "Editor"],
  [/^\/app\/project\/[^/]+\/questionnaire/, "Your business"],
  [/^\/app\/project\/[^/]+\/quote/, "Quote"],
  [/^\/app\/project\/[^/]+\/deployment/, "Deliver"],
  [/^\/app\/project\/[^/]+\/preview/, "Preview"],
  [/^\/app\/project/, "Project"],
  [/^\/app\/admin/, "Admin"],
];

function titleFor(pathname: string): string {
  for (const [re, title] of TITLES) if (re.test(pathname)) return title;
  return "Dashboard";
}

function Divider() {
  return <span aria-hidden className="h-[66px] w-px bg-line" />;
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
      } catch {
        // Keep the last known server-rendered value.
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
    <header className="sticky top-0 z-30 flex h-[66px] items-center justify-between border-b border-line bg-white pl-[30px]">
      <h1 className="text-lg font-medium leading-[1.2] text-black">{titleFor(pathname)}</h1>

      <div className="flex items-center gap-5 pr-6">
        <Divider />
        <Link
          href="/app/credits"
          className="flex items-center gap-3.5 text-black transition-opacity hover:opacity-70"
          title="Credits — click to buy more"
        >
          <Coins className="size-[26px] text-brand-blue" />
          <span className="text-lg leading-[1.2]">{balance.toLocaleString()} Credits left</span>
        </Link>
        <Divider />
        <UserMenu name={user.name} email={user.email} />
      </div>
    </header>
  );
}
