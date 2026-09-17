import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/session";
import { getOwnedProject } from "@/lib/projects/projects";
import { prisma } from "@/lib/prisma";
import {
  defaultQuestionnaire,
  parseQuestionnaireAnswers,
  type QuestionnaireAnswers,
} from "@/lib/questionnaire/schema";
import { parseAssetConsent, parseImportedBrand } from "@/lib/branding/imported-brand";
import { getTemplateById } from "@/lib/templates/store";
import { QuestionnaireWizard } from "@/components/questionnaire/questionnaire-wizard";
import { Button } from "@/components/ui/button";
import { ProjectStatus } from "@/lib/constants";
import { env } from "@/lib/env";

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

  // A design must be chosen before we can ask anything — there is no blank site.
  const template = project.templateId ? await getTemplateById(project.templateId) : null;
  if (!template) redirect("/app/templates");

  const q = await prisma.questionnaire.findUnique({ where: { projectId } });
  let initialAnswers: QuestionnaireAnswers | null = null;
  if (q) {
    try {
      initialAnswers = {
        ...parseQuestionnaireAnswers(q.answers),
        templateId: template.id,
      };
    } catch {
      // A scrape can persist a brand before the required text fields are filled.
      const raw = JSON.parse(q.answers) as Record<string, unknown>;
      initialAnswers = {
        ...defaultQuestionnaire,
        ...(raw as Partial<QuestionnaireAnswers>),
        importedBrand: parseImportedBrand(raw.importedBrand) ?? undefined,
        importedAssetConsent: parseAssetConsent(raw.importedAssetConsent) ?? undefined,
        templateId: template.id,
      };
    }
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
            : `We'll write the content for your ${template.name} design. Tell us about the business — we'll choose the pages that fit who you serve.`}
        </p>
      </div>

      <div className="mx-auto mb-6 flex max-w-2xl flex-wrap items-center gap-4 rounded-xl border bg-card p-4">
        <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
          {template.thumbnailUrl && (
            <Image
              src={template.thumbnailUrl}
              alt=""
              fill
              unoptimized
              sizes="96px"
              className="object-cover object-top"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Your design</p>
          <p className="font-display font-semibold">{template.name}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/app/templates">
            {alreadyGenerated
              ? `Change design · ${env.credits.costHeavyGenerate} credits`
              : "Change design"}
          </Link>
        </Button>
      </div>

      <QuestionnaireWizard
        projectId={projectId}
        templateId={template.id}
        templatePages={template.pages}
        initialAnswers={initialAnswers}
        alreadyGenerated={alreadyGenerated}
        generateCost={env.credits.costHeavyGenerate}
        importCost={env.credits.costScrapeImport}
      />
    </div>
  );
}
