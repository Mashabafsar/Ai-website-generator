import { after } from "next/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getCurrentSession } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/admin";
import { isAccountDeactivated } from "@/lib/accounts/deactivation";
import { getBalance } from "@/lib/credits/credits";
import { ensureLeadRegistered } from "@/lib/crm/scoring";
import { runCrmOutbox } from "@/lib/crm/sync";
import { AppShell } from "@/components/app/app-shell";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  if (await isAccountDeactivated(userId)) {
    try {
      await auth.api.signOut({ headers: await headers() });
    } catch {
      // Session may already be gone; still send them to login.
    }
    redirect("/login?deactivated=1");
  }

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
    <AppShell
      isAdmin={admin}
      user={{ name: session.user.name, email: session.user.email }}
      balance={balance}
    >
      {children}
    </AppShell>
  );
}
