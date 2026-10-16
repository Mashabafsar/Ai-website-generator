import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { AFTER_AUTH_PATH, sessionCanEnterApp } from "@/lib/auth/email-gate";
import { getCurrentSession } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { maskEmail } from "@/lib/notify/html";

export const metadata: Metadata = { title: "Verify your email" };

function firstString(
  value: string | string[] | undefined
): string {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value) && typeof value[0] === "string") return value[0].trim();
  return "";
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getCurrentSession();
  if (sessionCanEnterApp(session?.user, env.notify.smtpEnabled)) {
    redirect(AFTER_AUTH_PATH);
  }

  const params = await searchParams;
  const email = firstString(params.email) || session?.user.email || "";
  const unverified =
    firstString(params.unverified) === "1" || firstString(params.unverified) === "true";

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Check your inbox</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Confirm your email to finish creating your account. The link expires, so
        request a new one if you need it.
      </p>
      <div className="mt-8">
        <VerifyEmailForm
          email={email}
          maskedEmail={email ? maskEmail(email) : ""}
          unverified={unverified}
        />
      </div>
    </div>
  );
}
