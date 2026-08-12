import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createProjectForUser, getUserProject, ProjectLimitError } from "@/lib/projects/projects";
import { getTemplateById, getTemplateBySlug } from "@/lib/templates/store";
import { ProjectStatus } from "@/lib/constants";

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

  const existing = await getUserProject(userId);

  if (existing) {
    const canChangeDesign =
      existing.status === ProjectStatus.DRAFT || existing.status === ProjectStatus.FAILED;

    if (canChangeDesign && existing.templateId !== template.id) {
      await prisma.project.update({
        where: { id: existing.id },
        data: { templateId: template.id },
      });
    }

    redirect(
      canChangeDesign
        ? `/app/project/${existing.id}/questionnaire`
        : `/app/project/${existing.id}/preview`
    );
  }

  // Keep redirect() out of try/catch (it signals via a thrown control-flow error).
  const project = await createProjectForUser(userId, "My Website", template.id).catch(
    async (err) => {
      if (err instanceof ProjectLimitError) return getUserProject(userId);
      throw err;
    }
  );

  if (!project) redirect("/app/templates");
  redirect(`/app/project/${project.id}/questionnaire`);
}
