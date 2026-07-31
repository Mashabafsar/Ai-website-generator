"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, ExternalLink, Loader2, Rocket, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PackageType } from "@/lib/constants";

type DeploymentLog = { at: string; status: string; message: string };

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

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") toast.success("Payment successful — your delivery is unlocked.");
    if (checkout === "cancelled") toast.info("Checkout cancelled.");
    if (checkout) {
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  const isManaged = packageType === PackageType.MANAGED_HOSTING;

  async function deploy() {
    setDeploying(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/deploy`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deployment failed");
      toast.success("Deployment complete");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Deployment failed");
    } finally {
      setDeploying(false);
    }
  }

  if (!isPaid) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <h2 className="font-display text-lg font-semibold">Unlock delivery</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Your website is generated and safely backed up. Complete payment to{" "}
          {isManaged ? "deploy it live on your subdomain" : "download the full source code as a ZIP"}.
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
              <h2 className="font-display text-lg font-semibold">Managed hosting</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Deploy your site live on a subdomain. Re-deploy any time after edits.
              </p>
            </div>
            <Button variant="brand" onClick={deploy} disabled={deploying}>
              {deploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              {deployment?.liveUrl ? "Re-deploy" : "Deploy live"}
            </Button>
          </div>

          {deployment?.liveUrl && (
            <a
              href={deployment.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" /> {deployment.liveUrl}
            </a>
          )}

          {deployment?.logs && deployment.logs.length > 0 && (
            <div className="mt-5 rounded-lg border bg-muted/40 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Deployment log
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {deployment.logs.map((l, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-mono opacity-60">{new Date(l.at).toLocaleTimeString()}</span>
                    <span className="font-medium">{l.status}</span>
                    <span>{l.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Self-hosting</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Download your complete website source as a ZIP and host it anywhere.
          </p>
          <Button
            variant="brand"
            className="mt-5"
            asChild
          >
            <a href={`/api/projects/${projectId}/download`}>
              <Download className="h-4 w-4" /> Download ZIP
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
