"use client";

import type { ReactNode } from "react";
import { GenerationLockProvider } from "@/components/app/generation-lock";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";

/** Client shell so the generation lock can freeze navigation while a site is written. */
export function AppShell({
  isAdmin,
  user,
  balance,
  children,
}: {
  isAdmin: boolean;
  user: { name: string; email: string };
  balance: number;
  children: ReactNode;
}) {
  return (
    <GenerationLockProvider>
      <div className="font-app flex min-h-screen bg-white text-ink">
        <AppSidebar isAdmin={isAdmin} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar user={user} balance={balance} />
          <main className="flex-1 px-[30px] py-8">{children}</main>
        </div>
      </div>
    </GenerationLockProvider>
  );
}
