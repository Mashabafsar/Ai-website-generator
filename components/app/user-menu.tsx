"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, LogOut, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "@/lib/auth/client";
import { OPEN_ACCOUNT_SETTINGS } from "@/components/settings/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({
  name,
  email,
  navigationLocked = false,
  onBlocked,
}: {
  name: string;
  email: string;
  navigationLocked?: boolean;
  onBlocked?: () => void;
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const initials = (name || email)
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    if (signingOut) return;
    if (navigationLocked) {
      onBlocked?.();
      return;
    }
    setSigningOut(true);
    try {
      const { error } = await signOut();
      if (error) {
        toast.error(error.message || "Could not sign out. Please try again.");
        return;
      }
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Could not sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open account menu"
      >
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
        </Avatar>
        <span className="max-w-[140px] truncate text-base leading-[1.5] text-ink">
          {name || "Account"}
        </span>
        <ChevronDown className="size-4 text-ink" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[100] w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="truncate text-sm font-medium">{name || "Account"}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">{email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2"
          disabled={navigationLocked}
          onSelect={(event) => {
            event.preventDefault();
            if (navigationLocked) {
              onBlocked?.();
              return;
            }
            window.dispatchEvent(new Event(OPEN_ACCOUNT_SETTINGS));
            router.push("/app/settings?tab=account");
          }}
        >
          <UserIcon className="h-4 w-4" /> Account
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive"
          disabled={signingOut}
          onSelect={(event) => {
            event.preventDefault();
            void handleSignOut();
          }}
        >
          {signingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
