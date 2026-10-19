"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { changePassword, signOut } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readApiError } from "@/components/settings/read-api-error";

export function AccountTab({ user }: { user: { name: string; email: string } }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [savingName, setSavingName] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    setName(user.name);
  }, [user.name]);

  async function saveName(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Enter a name.");
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        const { message } = await readApiError(res, "Could not update your name.");
        toast.error(message);
        return;
      }
      toast.success("Name updated.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update your name.");
    } finally {
      setSavingName(false);
    }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Use at least 8 characters for the new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (error) {
        toast.error(error.message || "Could not change your password.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change your password.");
    } finally {
      setSavingPassword(false);
    }
  }

  async function deactivate() {
    setDeactivating(true);
    let locked = false;
    try {
      const res = await fetch("/api/account/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      if (!res.ok) {
        const { message } = await readApiError(res, "Could not deactivate this account.");
        toast.error(message);
        return;
      }
      locked = true;
      const { error } = await signOut();
      if (error) {
        console.error("[settings] sign out after deactivate:", error.message);
      }
    } catch (err) {
      if (!locked) {
        toast.error(err instanceof Error ? err.message : "Could not deactivate this account.");
        return;
      }
      console.error(
        "[settings] sign out after deactivate failed:",
        err instanceof Error ? err.message : err
      );
    } finally {
      if (locked) {
        window.location.assign("/login");
        return;
      }
      setDeactivating(false);
      setConfirmDeactivate(false);
    }
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">Signed in as {user.email}.</p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Name</CardTitle>
          <CardDescription>This is the name shown in the account menu.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveName} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="account-name">Name</Label>
              <Input
                id="account-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                maxLength={120}
              />
            </div>
            <Button type="submit" variant="brand" disabled={savingName}>
              {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save name
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Password</CardTitle>
          <CardDescription>Use your current password to set a new one.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={savePassword} className="max-w-md space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="brand" disabled={savingPassword}>
              {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Change password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Deactivate account</CardTitle>
          <CardDescription>
            Locks this account and signs you out. Your website data stays on file. Signing in
            again needs support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="destructive" onClick={() => setConfirmDeactivate(true)}>
            Deactivate account
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDeactivate}
        onOpenChange={setConfirmDeactivate}
        title="Deactivate your account?"
        description="This locks the account and signs you out. Your website data stays on file, and you will need support to sign in again."
        confirmLabel="Deactivate account"
        destructive
        pending={deactivating}
        onConfirm={() => void deactivate()}
      />
    </div>
  );
}
