import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { ProjectStatus, GithubSyncStatus, CreditLedgerReason } from "@/lib/constants";
import { assertAndSpend, refundSpend, InsufficientCreditsError } from "@/lib/credits/credits";
import { questionnaireSchema } from "@/lib/questionnaire/schema";
import { analyzeRequirements } from "@/lib/agents/requirement-analyst";
import { createTheme } from "@/lib/agents/theme";
import { sourceImages } from "@/lib/agents/image-sourcing";
import { assembleSite } from "@/lib/agents/section-assembly";
import { sanitizeBlueprint } from "@/lib/agents/security";
import { runQa, type QaReport } from "@/lib/agents/qa";
import { getAiProvider } from "@/lib/ai/provider";
import { trySyncProjectToGitHub } from "@/lib/github/github";
import { slugify } from "@/lib/utils";

export class AlreadyGeneratedError extends Error {
  constructor() {
    super("This website has already been generated.");
    this.name = "AlreadyGeneratedError";
  }
}
export class GenerationInProgressError extends Error {
  constructor() {
    super("Generation is already in progress.");
    this.name = "GenerationInProgressError";
  }
}
export class NoQuestionnaireError extends Error {
  constructor() {
    super("Complete the questionnaire before generating.");
    this.name = "NoQuestionnaireError";
  }
}

export type GenerateResult = {
  status: "GENERATED";
  qa: QaReport;
  balanceAfter: number;
};

/**
 * Orchestrator Agent — runs the initial generation pipeline:
 * requirements -> spend credits -> AI blueprint -> sanitize -> QA -> theme ->
 * images -> assemble -> persist -> GitHub (always). One generation per account.
 */
export async function generateWebsite(params: {
  userId: string;
  projectId: string;
}): Promise<GenerateResult> {
  const { userId, projectId } = params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { questionnaire: true },
  });
  if (!project) throw new Error("Project not found");

  // If a previous attempt crashed mid-flight, allow retry after 2 minutes.
  if (project.status === ProjectStatus.GENERATING) {
    const ageMs = Date.now() - new Date(project.updatedAt).getTime();
    if (ageMs < 2 * 60_000) throw new GenerationInProgressError();
    await prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.FAILED },
    });
  }

  if (project.blueprint && project.status !== ProjectStatus.DRAFT && project.status !== ProjectStatus.FAILED) {
    throw new AlreadyGeneratedError();
  }
  if (!project.questionnaire) throw new NoQuestionnaireError();

  const answers = questionnaireSchema.parse(JSON.parse(project.questionnaire.answers));
  const requirements = analyzeRequirements(answers);

  const spendKey = `heavy_generate:${projectId}`;
  const cost = env.credits.costHeavyGenerate;

  // Spend credits up-front (idempotent per project); refund on hard failure.
  const { balanceAfter } = await assertAndSpend({
    userId,
    amount: cost,
    reason: CreditLedgerReason.HEAVY_GENERATE,
    projectId,
    idempotencyKey: spendKey,
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { status: ProjectStatus.GENERATING },
  });

  try {
    const provider = getAiProvider();
    let blueprint = await provider.generateBlueprint(requirements);

    blueprint = sanitizeBlueprint(blueprint);
    const qa = runQa(blueprint);

    const theme = createTheme(requirements.colorPreference, requirements.visualStyle);
    blueprint = await sourceImages(blueprint);
    const site = assembleSite(blueprint, theme);

    await prisma.project.update({
      where: { id: projectId },
      data: {
        businessName: requirements.business.name,
        slug: slugify(requirements.business.name),
        blueprint: JSON.stringify(blueprint),
        assembledPages: JSON.stringify(site),
        theme: JSON.stringify(theme),
        status: ProjectStatus.GENERATED,
        githubSyncStatus: GithubSyncStatus.PENDING,
      },
    });

    // Always back up to GitHub (payment-independent). Best-effort; won't throw.
    await trySyncProjectToGitHub(projectId);

    return { status: "GENERATED", qa, balanceAfter };
  } catch (err) {
    // Refund the spend and mark the project failed so the user can retry.
    await refundSpend({ userId, amount: cost, projectId, spendIdempotencyKey: spendKey });
    await prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.FAILED },
    });
    throw err;
  }
}

export { InsufficientCreditsError };
