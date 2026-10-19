"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, ExternalLink, Loader2, Rocket, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PackageType } from "@/lib/constants";

type DeploymentLog = { at: string; status: string; message: string };

const LOG_STATUS: Record<string, string> = {
  PENDING: "Starting",
  BUILD_STARTED: "Building",
  DEPLOYED: "Live",
  FAILED: "Couldn't go live",
  CANCELLED: "Cancelled",
  REPOSITORY_CREATED: "Saved",
};

export function DeliveryPanel({
  projectId,
  packageType,
  isPaid,
  deployment,
}: {
  projectId: string;
  packageType: string;
  isPaid: boolean;
  deployment: { status: string; liveUrl: string | null; logs: DeploymentLog[] } | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deploying, setDeploying] = useState(false);
  const [confirmLive, setConfirmLive] = useState(false);
  const autoStarted = useRef(false);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") toast.success("Payment successful — your delivery is unlocked.");
    if (checkout === "cancelled") toast.info("Payment was cancelled.");
    if (checkout) {
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  const isManaged = packageType === PackageType.MANAGED_HOSTING;
  const domainUrl = deployment?.liveUrl ?? null;
  const isLive = Boolean(domainUrl) && deployment?.status === "DEPLOYED";

  async function deploy() {
    setDeploying(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/deploy`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not publish the site");
      toast.success("Your website is live");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not publish the site");
    } finally {
      setDeploying(false);
      setConfirmLive(false);
    }
  }

  useEffect(() => {
    if (!isPaid || !isManaged || isLive || deploying) return;
    if (deployment?.status === "FAILED") return;
    if (autoStarted.current) return;
    autoStarted.current = true;
    void deploy();
    // Publish as soon as managed hosting is paid.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaid, isManaged, isLive, deployment?.status]);

  if (!isPaid) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <h2 className="font-display text-lg font-semibold">Unlock delivery</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Your website is generated. Complete payment to{" "}
          {isManaged
            ? "publish it live with one click. We host it for you — no files to download or upload."
            : "download your website files"}
          .
        </p>
        <Button variant="brand" className="mt-5" onClick={() => router.push(`/app/project/${projectId}/quote`)}>
          Go to quote & payment
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
        <ShieldCheck className="h-4 w-4" /> Payment complete — delivery unlocked
      </div>

      {isManaged ? (
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold">
                {isLive ? "Your website is live" : "Publish your website"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {deploying
                  ? "Going live — this usually takes under a minute. Keep this tab open."
                  : isLive
                    ? "We host this for you. Update the live site after you make edits."
                    : "We'll put the site online for you. You don't need to download files or sign up for anything else."}
              </p>
            </div>
            <Button variant="brand" onClick={() => setConfirmLive(true)} disabled={deploying}>
              {deploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              {deploying ? "Going live…" : isLive ? "Update live site" : "Make it live"}
            </Button>
          </div>

          {domainUrl && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live site</p>
              <a
                href={domainUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" /> {domainUrl.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}

          {deployment?.logs && deployment.logs.length > 0 && (
            <div className="mt-5 rounded-lg border bg-muted/40 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                What's happening
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {deployment.logs.map((l, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="opacity-60">{new Date(l.at).toLocaleTimeString()}</span>
                    <span className="font-medium">{LOG_STATUS[l.status] ?? l.status}</span>
                    <span>{l.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Download your files</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Download your website files and put them online anywhere you like.
          </p>
          <Button variant="brand" className="mt-5" asChild>
            <a href={`/api/projects/${projectId}/download`}>
              <Download className="h-4 w-4" /> Get your files
            </a>
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmLive}
        onOpenChange={setConfirmLive}
        title={isLive ? "Update the live site?" : "Put your website online?"}
        description={
          isLive
            ? "The public site will be replaced with the version you have now."
            : "We'll publish this website so anyone with the link can open it."
        }
        confirmLabel={isLive ? "Update live site" : "Make it live"}
        pending={deploying}
        onConfirm={() => void deploy()}
      />
    </div>
  );
}
