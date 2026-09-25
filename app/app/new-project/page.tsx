import { redirect } from "next/navigation";
import type { Project } from "@prisma/client";
import { getCurrentUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { CrmScoreAction } from "@/lib/crm/config";
import { awardOneTimeAction } from "@/lib/crm/scoring";
import { scheduleCrmDrain } from "@/lib/crm/sync";
import {
  canChangeProjectDesign,
  createProjectForUser,
  getUserProject,
  isProjectLimitError,
  nextProjectStep,
} from "@/lib/projects/projects";
import { getTemplateById, getTemplateBySlug } from "@/lib/templates/store";

/**
 * Selecting a design lands here. It attaches the chosen template to the user's
 * single project (creating it if needed) and sends them to the questionnaire.
 * Selection is free — credits are only spent when generation runs.
 */
export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ templateId?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const { templateId } = await searchParams;
  if (!templateId) redirect("/app/templates");

  const template =
    (await getTemplateById(templateId)) ?? (await getTemplateBySlug(templateId));
  if (!template || !template.published) redirect("/app/templates");

  // Landing here with a real published design is the moment a theme is chosen.
  // Scored once per account, so later design switches don't keep adding points.
  await recordThemeSelection(userId);

  const existing = await getUserProject(userId);
  if (existing) {
    redirect(await continueExistingProject(existing, template.id));
  }

  // Keep redirect() out of try/catch (it signals via a thrown control-flow error).
  const project = await createProjectForUser(userId, "My Website", template.id).catch(
    async (err) => {
      if (!isProjectLimitError(err)) throw err;
      return getUserProject(userId);
    }
  );

  if (!project) redirect("/app/templates");
  redirect(await continueExistingProject(project, template.id));
}

/** Score the theme choice without ever blocking the redirect into setup. */
async function recordThemeSelection(userId: string): Promise<void> {
  try {
    await awardOneTimeAction(userId, CrmScoreAction.THEME_SELECTED);
    scheduleCrmDrain();
  } catch (err) {
    console.error("[crm] theme score failed:", err instanceof Error ? err.message : err);
  }
}

/**
 * Reuse the one project per user. Draft/failed sites can still adopt this
 * design; generated sites continue at the same step as the dashboard.
 */
async function continueExistingProject(project: Project, templateId: string): Promise<string> {
  if (canChangeProjectDesign(project.status)) {
    if (project.templateId !== templateId) {
      await prisma.project.update({
        where: { id: project.id },
        data: { templateId },
      });
    }
    return `/app/project/${project.id}/questionnaire`;
  }

  return nextProjectStep(project).href;
}
