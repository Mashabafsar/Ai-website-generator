import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/session";
import { getOwnedProject } from "@/lib/projects/projects";
import { hasPaidPackage } from "@/lib/payments/access";
import { ProjectStatus, PackageType } from "@/lib/constants";
import { ProjectTabs } from "@/components/app/project-tabs";
import { StatusBadge } from "@/components/app/status-badge";
import { DeliveryPanel } from "@/components/app/delivery-panel";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Deliver" };

type DeploymentLog = { at: string; status: string; message: string };

export default async function DeploymentPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const { projectId } = await params;

  const project = await getOwnedProject(userId, projectId);
  if (!project) notFound();
  if (project.status === ProjectStatus.DRAFT || !project.blueprint) {
    redirect(`/app/project/${projectId}/questionnaire`);
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
        liveUrl: deploymentRow.liveUrl,
        logs: deploymentRow.logs ? (JSON.parse(deploymentRow.logs) as DeploymentLog[]) : [],
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
