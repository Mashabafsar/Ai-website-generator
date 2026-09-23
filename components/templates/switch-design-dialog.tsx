"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Coins, Loader2, Repeat } from "lucide-react";
import { toast } from "sonner";
import { notifyCreditsChanged } from "@/lib/credits/notify";
import type { SiteTemplate } from "@/lib/templates/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Confirms a paid redesign. Switching re-runs the whole content generation
 * against the new design's slots, so the user is told plainly what it costs and
 * what they lose before anything is charged.
 */
export function SwitchDesignDialog({
  template,
  currentTemplateName,
  projectId,
  cost,
  balance,
  onOpenChange,
  onSwitched,
}: {
  template: SiteTemplate | null;
  currentTemplateName: string | null;
  projectId: string;
  cost: number;
  balance: number;
  onOpenChange: (open: boolean) => void;
  onSwitched: () => void;
}) {
  const [working, setWorking] = useState(false);
  const affordable = balance >= cost;

  async function confirm() {
    if (!template) return;
    setWorking(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/switch-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      const data = await res.json();
      notifyCreditsChanged();
      if (!res.ok) throw new Error(data.error || "Could not switch designs");

      toast.success(`Rebuilt on ${template.name} · ${data.balanceAfter} credits left`);
      onSwitched();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not switch designs");
    } finally {
      setWorking(false);
    }
  }

  return (
    <Dialog open={Boolean(template)} onOpenChange={(open) => !working && onOpenChange(open)}>
      <DialogContent className="sm:max-w-lg">
        {template && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                Rebuild on {template.name}?
              </DialogTitle>
              <DialogDescription>
                {currentTemplateName
                  ? `Your website is currently built on ${currentTemplateName}.`
                  : "Your website is currently built on another design."}{" "}
                Our AI will rewrite your content to fit {template.name}&apos;s layout.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 rounded-lg border bg-secondary/40 p-3">
                <Coins className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">
                    {cost} credits — you have {balance}
                  </p>
                  <p className="text-muted-foreground">
                    Same price as the first build, because the whole site is written again.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="font-medium">Your edits to the current site will be replaced</p>
                  <p className="text-muted-foreground">
                    Your business details stay the same. Anything you have already paid for stays
                    paid, and a live site keeps running until you put the new version online.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {affordable ? (
                <Button variant="brand" onClick={confirm} disabled={working}>
                  {working ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Rebuilding…
                    </>
                  ) : (
                    <>
                      <Repeat className="h-4 w-4" />
                      Switch for {cost} credits
                    </>
                  )}
                </Button>
              ) : (
                <Button asChild variant="brand">
                  <Link href="/app/credits">
                    <Coins className="h-4 w-4" />
                    Buy credits to switch
                  </Link>
                </Button>
              )}
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={working}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
