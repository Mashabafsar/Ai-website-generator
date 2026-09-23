import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/session";
import { getOwnedProject, parseProject } from "@/lib/projects/projects";
import { withCustomerPhotos } from "@/lib/projects/customer-photos";
import { ProjectStatus, PAID_PROJECT_STATUSES } from "@/lib/constants";
import { ProjectTabs } from "@/components/app/project-tabs";
import { StatusBadge } from "@/components/app/status-badge";
import { GenerationNotice } from "@/components/app/generation-notice";
import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { getTemplateById } from "@/lib/templates/store";
import { env } from "@/lib/env";
import type { ThemeTokens } from "@/lib/blueprint/types";

export const metadata: Metadata = { title: "Editor" };

const FALLBACK_THEME: ThemeTokens = {
  colors: {
    primary: "#6366f1",
    secondary: "#0ea5e9",
    accent: "#14b8a6",
    background: "#ffffff",
    foreground: "#0f172a",
  },
  radius: "0.75rem",
  fontStyle: "modern sans-serif",
};

export default async function EditorPage({
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

  const project = await withCustomerPhotos(parseProject(raw));
  if (!project.blueprint) redirect(`/app/project/${projectId}/questionnaire`);

  const theme = project.theme ?? project.assembledPages?.theme ?? FALLBACK_THEME;
  const template = project.templateId ? await getTemplateById(project.templateId) : null;
  const renderer = template?.renderer ?? project.assembledPages?.renderer;
  const templateSlug = template?.slug ?? project.assembledPages?.templateSlug;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold tracking-tight">Editor</h1>
          <StatusBadge status={project.status} />
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

      <EditorWorkspace
        projectId={projectId}
        initialBlueprint={project.blueprint}
        initialTheme={theme}
        templateName={template?.name ?? "Your design"}
        renderer={renderer}
        templateSlug={templateSlug}
        contact={project.assembledPages?.contact}
        editCost={env.credits.costLightEdit}
      />
    </div>
  );
}
