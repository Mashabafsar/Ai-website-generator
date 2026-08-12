import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { getCurrentUserId } from "@/lib/auth/session";
import { getUserProject } from "@/lib/projects/projects";
import { getTemplateById, listPublishedTemplates } from "@/lib/templates/store";
import { templateSlugsWithDemo } from "@/lib/templates/demos";
import { getBalance } from "@/lib/credits/credits";
import { ProjectStatus } from "@/lib/constants";
import { env } from "@/lib/env";
import { Badge } from "@/components/ui/badge";
import { TemplateGallery } from "@/components/templates/gallery";

export const metadata: Metadata = { title: "Templates" };

export default async function TemplatesPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const [templates, project, balance] = await Promise.all([
    listPublishedTemplates(),
    getUserProject(userId),
    getBalance(userId),
  ]);

  // Before the site exists a design is free to pick; afterwards, choosing a
  // different one rebuilds the whole site and costs another generation.
  const hasSite =
    Boolean(project) &&
    project!.status !== ProjectStatus.DRAFT &&
    project!.status !== ProjectStatus.FAILED;

  const currentTemplate =
    hasSite && project?.templateId ? await getTemplateById(project.templateId) : null;

  const cost = env.credits.costHeavyGenerate;

  return (
    <div>
      <div className="mb-8 max-w-2xl">
        <Badge variant="brand" className="mb-4">
          <Sparkles className="mr-1 h-3 w-3" />
          {hasSite ? `Switching designs costs ${cost} credits` : "Choosing a design is free"}
        </Badge>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {hasSite ? "Change your website design" : "Pick your website design"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {hasSite ? (
            <>
              Open any design to scroll the whole thing before you commit. Switching rebuilds your
              website on the new layout and rewrites your content to fit it, for {cost} credits.
            </>
          ) : (
            <>
              Every design below is a complete, finished website — open one to scroll through the
              entire thing. Choose it, answer a few questions about your business, and our AI writes
              all the content to fit. Generation costs {cost} credits.
            </>
          )}
        </p>
      </div>

      <TemplateGallery
        templates={templates}
        demoSlugs={templateSlugsWithDemo()}
        existing={
          hasSite && project
            ? {
                projectId: project.id,
                templateId: project.templateId,
                templateName: currentTemplate?.name ?? null,
              }
            : null
        }
        switchCost={cost}
        balance={balance}
      />
    </div>
  );
}
