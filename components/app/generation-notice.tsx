"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { notifyCreditsChanged } from "@/lib/credits/notify";

/**
 * Shown on a website whose copy came from its design's starter content because
 * no writing model could be reached. The build is kept — a site is better than
 * an error — but it was refunded, and saying so is the whole point of this
 * banner: the same outage used to be invisible and still charged full price.
 */
export function GenerationNotice({
  projectId,
  refundedCredits,
  generateCost,
  canRetry,
}: {
  projectId: string;
  refundedCredits: number;
  generateCost: number;
  canRetry: boolean;
}) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  async function retry() {
    setRetrying(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      notifyCreditsChanged();
      if (!res.ok) {
        if (data.code === "INSUFFICIENT_CREDITS") {
          toast.error("Not enough credits — redirecting to top up.");
          router.push("/app/credits");
          return;
        }
        throw new Error(data.error || "We couldn't rebuild your content.");
      }
      if (data.fromTemplate) {
        toast.error("Our writing tools are still unavailable. You were not charged.");
      } else {
        toast.success("Your content has been rewritten.");
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "We couldn't rebuild your content.");
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="flex flex-wrap items-start gap-4 border border-primary-border bg-primary-surface p-5">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div className="min-w-[16rem] flex-1 space-y-1">
        <p className="font-semibold">This website is using starter content</p>
        <p className="text-sm text-ink-soft">
          We couldn&apos;t reach the tools that write your copy, so your site was filled
          in with its design&apos;s example text instead of words written for your
          business. Everything else — your layout, colours and contact details — is
          yours.
        </p>
        <p className="text-sm text-ink-soft">
          You have not been charged for this build:{" "}
          <span className="font-semibold">{refundedCredits} credits</span> were returned
          to your balance.
        </p>
      </div>
      {canRetry && (
        <Button variant="brand" size="sm" onClick={retry} disabled={retrying}>
          {retrying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Write it again ({generateCost} credits)
        </Button>
      )}
    </div>
  );
}
