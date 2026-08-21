import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/admin";
import { getBalance } from "@/lib/credits/credits";
import { AppHeader } from "@/components/app/app-header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");

  const [balance, admin] = await Promise.all([
    getBalance(session.user.id),
    isAdmin(session.user.id, session.user.email),
  ]);

  return (
    <div className="min-h-screen bg-secondary/30">
      <AppHeader
        user={{ name: session.user.name, email: session.user.email }}
        balance={balance}
        isAdmin={admin}
      />
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
