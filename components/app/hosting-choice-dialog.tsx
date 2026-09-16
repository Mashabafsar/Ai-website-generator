"use client";

import { useEffect, useState } from "react";
import { Cloud, FolderDown, Loader2 } from "lucide-react";
import { PackageType } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const OPTIONS = [
  {
    type: PackageType.SELF_HOSTING,
    icon: FolderDown,
    title: "Self-hosting",
    desc: "Download a ZIP of the full site and host it yourself. No monthly fee.",
  },
  {
    type: PackageType.MANAGED_HOSTING,
    icon: Cloud,
    title: "Managed hosting",
    desc: "We publish the site to a live URL for you. No files to download or upload.",
  },
] as const;

export function HostingChoiceDialog({
  open,
  onOpenChange,
  initialPackage,
  submitting,
  confirmLabel,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPackage?: string | null;
  submitting: boolean;
  confirmLabel: string;
  onConfirm: (packageType: PackageType) => void;
}) {
  const [selected, setSelected] = useState<PackageType | null>(
    initialPackage === PackageType.MANAGED_HOSTING || initialPackage === PackageType.SELF_HOSTING
      ? initialPackage
      : null
  );

  useEffect(() => {
    if (!open) return;
    setSelected(
      initialPackage === PackageType.MANAGED_HOSTING || initialPackage === PackageType.SELF_HOSTING
        ? initialPackage
        : null
    );
  }, [open, initialPackage]);

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">How should we deliver this site?</DialogTitle>
          <DialogDescription>
            This choice sets the quote. Pages, sections, and add-ons are calculated the same way on
            either package.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          {OPTIONS.map((option) => {
            const active = selected === option.type;
            const Icon = option.icon;
            return (
              <button
                key={option.type}
                type="button"
                onClick={() => setSelected(option.type)}
                className={cn(
                  "rounded-xl border p-5 text-left transition-[border-color,background-color,transform,box-shadow] duration-150 ease-out active:scale-[0.98]",
                  active
                    ? "border-primary bg-primary/5 shadow-[0_0_0_1px] shadow-primary/30"
                    : "hover:bg-secondary"
                )}
              >
                <Icon className="size-5 text-primary" />
                <p className="mt-3 font-semibold">{option.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{option.desc}</p>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button
            variant="brand"
            disabled={!selected || submitting}
            onClick={() => selected && onConfirm(selected)}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
