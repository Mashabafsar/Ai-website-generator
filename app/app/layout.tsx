import { after } from "next/server";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/admin";
import { getBalance } from "@/lib/credits/credits";
import { ensureLeadRegistered } from "@/lib/crm/scoring";
import { runCrmOutbox } from "@/lib/crm/sync";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  after(async () => {
    try {
      if (await ensureLeadRegistered(userId)) await runCrmOutbox(5);
    } catch (err) {
      console.error("[crm] lead check failed:", err instanceof Error ? err.message : err);
    }
  });

  const [balance, admin] = await Promise.all([
    getBalance(session.user.id),
    isAdmin(session.user.id, session.user.email),
  ]);

  return (
    <div className="font-app flex min-h-screen bg-white text-ink">
      <AppSidebar isAdmin={admin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          user={{ name: session.user.name, email: session.user.email }}
          balance={balance}
        />
        <main className="flex-1 px-[30px] py-8">{children}</main>
      </div>
    </div>
  );
}
