import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { getBalance } from "@/lib/credits/credits";
import { AppHeader } from "@/components/app/app-header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");

  const balance = await getBalance(session.user.id);

  return (
    <div className="min-h-screen bg-secondary/30">
      <AppHeader
        user={{ name: session.user.name, email: session.user.email }}
        balance={balance}
      />
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
