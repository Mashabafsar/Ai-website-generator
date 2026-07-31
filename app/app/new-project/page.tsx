import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/session";
import { createProjectForUser, getUserProject, ProjectLimitError } from "@/lib/projects/projects";

// Creates the user's single project (if none) and sends them to the questionnaire.
// One-project-per-user is enforced in createProjectForUser.
export default async function NewProjectPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const existing = await getUserProject(userId);
  if (existing) redirect(`/app/project/${existing.id}/questionnaire`);

  // Keep redirect() out of try/catch (it signals via a thrown control-flow error).
  const project = await createProjectForUser(userId, "My Website").catch(async (err) => {
    if (err instanceof ProjectLimitError) return getUserProject(userId);
    throw err;
  });

  if (!project) redirect("/app/dashboard");
  redirect(`/app/project/${project.id}/questionnaire`);
}
