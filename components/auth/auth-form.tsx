"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signIn, signUp } from "@/lib/auth/client";
import { AFTER_AUTH_PATH, isUnverifiedEmailError, verifyEmailPath } from "@/lib/auth/email-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Opt-in must be a deliberate act, so this starts unchecked every time.
  const [marketingConsent, setMarketingConsent] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSignup && !marketingConsent) {
      toast.error("Please agree to the marketing notice to create an account.");
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await signUp.email({
          name: name.trim() || email.split("@")[0],
          email: email.trim(),
          password,
          callbackURL: AFTER_AUTH_PATH,
        });
        if (error) throw new Error(error.message || "Could not create account");
        toast.success("Account created.");
      } else {
        const { error } = await signIn.email({
          email: email.trim(),
          password,
          callbackURL: AFTER_AUTH_PATH,
        });
        if (error) {
          if (isUnverifiedEmailError(error)) {
            window.location.assign(verifyEmailPath(email.trim(), true));
            return;
          }
          throw new Error(error.message || "Invalid email or password");
        }
      }

      // Consent is recorded after the session exists, and never gates sign-in:
      // a CRM hiccup must not strand someone who just authenticated.
      try {
        await fetch("/api/crm/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            marketingConsent: isSignup ? true : false,
            mode: isSignup ? "register" : "login",
          }),
        });
      } catch {
        // The registration score is also awarded server-side on account
        // creation, so the only thing lost here is a same-visit consent write.
      }

      // A full page load is what makes the new session cookie visible to the
      // server on the very next render. A client-side router.push() races with
      // the cookie write and silently leaves the user sitting on this form.
      // Signup always lands on the check-inbox page; if SMTP is off and a
      // session exists, that page sends them into the app.
      window.location.assign(isSignup ? verifyEmailPath(email.trim()) : AFTER_AUTH_PATH);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSignup && (
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Jane Founder"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
      </div>

      {isSignup && (
        <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
          <input
            id="marketing-consent"
            type="checkbox"
            required
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-input accent-primary"
            aria-required="true"
          />
          <Label
            htmlFor="marketing-consent"
            className="cursor-pointer text-sm font-normal leading-snug text-muted-foreground"
          >
            I agree that my email and information may be used for marketing purposes.{" "}
            <span className="text-destructive">*</span>
          </Label>
        </div>
      )}

      <Button
        type="submit"
        variant="brand"
        className="w-full"
        disabled={loading || (isSignup && !marketingConsent)}
        size="lg"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSignup ? "Create account" : "Log in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
