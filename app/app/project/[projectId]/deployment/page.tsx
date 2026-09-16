import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/session";
import { getOwnedProject } from "@/lib/projects/projects";
import { hasPaidPackage } from "@/lib/payments/access";
import { reconcileWebsiteCheckout, reconcilePendingWebsiteCheckout } from "@/lib/stripe/reconcile";
import { ProjectStatus, PackageType } from "@/lib/constants";
import { ProjectTabs } from "@/components/app/project-tabs";
import { StatusBadge } from "@/components/app/status-badge";
import { DeliveryPanel } from "@/components/app/delivery-panel";
import { prisma } from "@/lib/prisma";
import { hideDeploymentHosts, publicSiteUrl } from "@/lib/deployment/url";

export const metadata: Metadata = { title: "Deliver" };

type DeploymentLog = { at: string; status: string; message: string };

export default async function DeploymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ checkout?: string; session_id?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const { projectId } = await params;

  const project = await getOwnedProject(userId, projectId);
  if (!project) notFound();
  if (project.status === ProjectStatus.DRAFT || !project.blueprint) {
    redirect(`/app/project/${projectId}/questionnaire`);
  }

  // Fallback to the webhook: confirm the payment on return so delivery unlocks
  // even when the webhook can't reach the app. Uses the session id from the
  // redirect when present, otherwise the project's latest pending payment (so an
  // already-paid-but-stuck purchase self-heals on the next visit).
  const { session_id: sessionId } = await searchParams;
  try {
    if (sessionId) {
      await reconcileWebsiteCheckout({ userId, projectId, sessionId });
    } else {
      await reconcilePendingWebsiteCheckout({ userId, projectId });
    }
  } catch {
    // Non-fatal: the webhook remains the backstop.
  }

  const [quote, deploymentRow, isPaid] = await Promise.all([
    prisma.quote.findUnique({ where: { projectId } }),
    prisma.deployment.findUnique({ where: { projectId } }),
    hasPaidPackage(projectId),
  ]);

  const packageType = quote?.packageType ?? PackageType.SELF_HOSTING;

  const deployment = deploymentRow
    ? {
        status: deploymentRow.status,
        liveUrl: publicSiteUrl(deploymentRow),
        logs: deploymentRow.logs
          ? (JSON.parse(deploymentRow.logs) as DeploymentLog[]).map((l) => ({
              ...l,
              message: hideDeploymentHosts(l.message),
            }))
          : [],
      }
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold tracking-tight">Deliver your website</h1>
          <StatusBadge status={project.status} />
        </div>
      </div>

      <ProjectTabs projectId={projectId} />

      <Suspense fallback={null}>
        <DeliveryPanel
          projectId={projectId}
          packageType={packageType}
          isPaid={isPaid}
          deployment={deployment}
        />
      </Suspense>
    </div>
  );
}
