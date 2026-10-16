"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendVerificationEmail } from "@/lib/auth/client";
import { AFTER_AUTH_PATH } from "@/lib/auth/email-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VerifyEmailForm({
  email,
  maskedEmail,
  unverified,
}: {
  email: string;
  maskedEmail: string;
  unverified: boolean;
}) {
  const [value, setValue] = useState(email);
  const [loading, setLoading] = useState(false);
  const knownEmail = Boolean(email);

  async function handleResend() {
    const target = value.trim();
    if (!target) {
      toast.error("Enter the email you used to sign up.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await sendVerificationEmail({
        email: target,
        callbackURL: AFTER_AUTH_PATH,
      });
      if (error) throw new Error(error.message || "Could not send verification email");
      toast.success("Verification email sent.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send verification email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {unverified && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          Verify your email before logging in. We can send a new link below.
        </p>
      )}

      {knownEmail ? (
        <p className="text-sm text-muted-foreground">
          Sent to <span className="font-medium text-foreground">{maskedEmail}</span>.
        </p>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="verify-email">Email</Label>
          <Input
            id="verify-email"
            type="email"
            required
            placeholder="you@company.com"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="email"
          />
        </div>
      )}

      <Button
        type="button"
        variant="brand"
        className="w-full"
        disabled={loading}
        size="lg"
        onClick={() => void handleResend()}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Resend verification email
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Wrong account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
