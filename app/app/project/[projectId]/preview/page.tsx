import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Pencil, Repeat } from "lucide-react";
import { getCurrentUserId } from "@/lib/auth/session";
import { getOwnedProject, parseProject } from "@/lib/projects/projects";
import { ProjectStatus, PAID_PROJECT_STATUSES } from "@/lib/constants";
import { env } from "@/lib/env";
import { GenerationNotice } from "@/components/app/generation-notice";
import { PreviewShell } from "@/components/editor/preview-shell";
import { ProjectTabs } from "@/components/app/project-tabs";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Preview" };

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const { projectId } = await params;

  const raw = await getOwnedProject(userId, projectId);
  if (!raw) notFound();

  if (raw.status === ProjectStatus.DRAFT || !raw.blueprint) {
    redirect(`/app/project/${projectId}/questionnaire`);
  }

  const project = parseProject(raw);
  const site = project.assembledPages;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold tracking-tight">{project.businessName}</h1>
          <StatusBadge status={project.status} />
        </div>
        <div className="flex items-center gap-2">
          {/* Not happy with the look? The library can rebuild this site on any
              other design for the price of a generation. */}
          <Button asChild variant="outline" size="sm">
            <Link href="/app/templates">
              <Repeat className="h-4 w-4" /> Try another design
            </Link>
          </Button>
          <Button asChild variant="brand" size="sm">
            <Link href={`/app/project/${projectId}/editor`}>
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          </Button>
        </div>
      </div>

      <ProjectTabs projectId={projectId} />

      {project.generationDegraded && (
        <GenerationNotice
          projectId={projectId}
          refundedCredits={env.credits.costHeavyGenerate}
          generateCost={env.credits.costHeavyGenerate}
          canRetry={!PAID_PROJECT_STATUSES.has(project.status)}
        />
      )}

      {site ? (
        <PreviewShell site={site} projectId={projectId} />
      ) : (
        <p className="text-muted-foreground">We couldn&apos;t show the preview. Try writing the site again.</p>
      )}
    </div>
  );
}
