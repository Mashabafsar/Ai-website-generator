import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/session";
import { getOwnedProject } from "@/lib/projects/projects";
import { prisma } from "@/lib/prisma";
import { questionnaireSchema, type QuestionnaireAnswers } from "@/lib/questionnaire/schema";
import { QuestionnaireWizard } from "@/components/questionnaire/questionnaire-wizard";
import { ProjectStatus } from "@/lib/constants";

export const metadata: Metadata = { title: "Questionnaire" };

export default async function QuestionnairePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const { projectId } = await params;

  const project = await getOwnedProject(userId, projectId);
  if (!project) notFound();

  const q = await prisma.questionnaire.findUnique({ where: { projectId } });
  let initialAnswers: QuestionnaireAnswers | null = null;
  if (q) {
    const parsed = questionnaireSchema.safeParse(JSON.parse(q.answers));
    if (parsed.success) initialAnswers = parsed.data;
  }

  // FAILED projects may retry generation even if a partial blueprint exists.
  const alreadyGenerated =
    Boolean(project.blueprint) &&
    project.status !== ProjectStatus.DRAFT &&
    project.status !== ProjectStatus.FAILED;

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Tell us about your business
        </h1>
        <p className="mt-2 text-muted-foreground">
          {alreadyGenerated
            ? "Update your answers below."
            : "A few quick questions and we'll generate your website."}
        </p>
      </div>
      <QuestionnaireWizard
        projectId={projectId}
        initialAnswers={initialAnswers}
        alreadyGenerated={alreadyGenerated}
      />
    </div>
  );
}
