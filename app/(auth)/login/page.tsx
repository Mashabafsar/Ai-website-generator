import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const deactivated = params.deactivated === "1" || params.deactivated === "true";

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Log in to open your website project.
      </p>
      {deactivated && (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          This account was deactivated because it had no website or credit purchase within 14
          days. Contact support if you need access.
        </p>
      )}
      <div className="mt-8">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
