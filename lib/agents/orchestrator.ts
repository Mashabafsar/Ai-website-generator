import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import {
  ProjectStatus,
  GithubSyncStatus,
  CreditLedgerReason,
  DeploymentStatus,
} from "@/lib/constants";
import { assertAndSpend, refundSpend, InsufficientCreditsError } from "@/lib/credits/credits";
import { parseQuestionnaireAnswers, type QuestionnaireAnswers } from "@/lib/questionnaire/schema";
import type { SiteTemplate } from "@/lib/templates/types";
import { analyzeRequirements } from "@/lib/agents/requirement-analyst";
import { createTheme, validateThemeChoice } from "@/lib/agents/theme";
import { themeSchema } from "@/lib/blueprint/schema";
import { selectIcons } from "@/lib/agents/icon-selection";
import { sourceImages } from "@/lib/agents/image-sourcing";
import { assembleSite } from "@/lib/agents/section-assembly";
import { sanitizeBlueprint } from "@/lib/agents/security";
import { conformToTemplate } from "@/lib/agents/template-fill";
import { getTemplateById } from "@/lib/templates/store";
import { runQa, type QaReport } from "@/lib/agents/qa";
import { getAiProvider } from "@/lib/ai/provider";
import { withUsageCapture } from "@/lib/ai/usage";
import { persistUsageEvents } from "@/lib/ai/usage-record";
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
export class NoTemplateError extends Error {
  constructor() {
    super("Choose a website design before generating.");
    this.name = "NoTemplateError";
  }
}
export class SameTemplateError extends Error {
  constructor() {
    super("Your website already uses this design.");
    this.name = "SameTemplateError";
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
 * icons -> images -> assemble -> persist -> GitHub (always). One generation per
 * account.
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
  if (!project.templateId) throw new NoTemplateError();

  const answers = parseQuestionnaireAnswers(project.questionnaire.answers);
  const template = await getTemplateById(project.templateId);
  if (!template) throw new NoTemplateError();

  return runGeneration({
    userId,
    projectId,
    template,
    answers,
    spendKey: `heavy_generate:${projectId}`,
    existingLogoUrl: readThemeLogoUrl(project.theme),
  });
}

/** The logo already saved on a project, if it still passes theme validation. */
function readThemeLogoUrl(raw: string | null): string | undefined {
  if (!raw) return undefined;
  try {
    const value = (JSON.parse(raw) as { logoUrl?: unknown }).logoUrl;
    const parsed = themeSchema.shape.logoUrl.safeParse(value);
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Rebuild the site on a different design. Content is rewritten to fit the new
 * template's slots, so this costs the same as a first generation and is charged
 * against a fresh idempotency key. Allowed at any point in the journey; a paid
 * project stays paid and only its deployment is marked as needing a refresh.
 */
export async function switchProjectTemplate(params: {
  userId: string;
  projectId: string;
  templateId: string;
}): Promise<GenerateResult> {
  const { userId, projectId, templateId } = params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { questionnaire: true },
  });
  if (!project) throw new Error("Project not found");
  if (!project.questionnaire) throw new NoQuestionnaireError();
  if (project.templateId === templateId) throw new SameTemplateError();

  // A switch mid-generation would race the running pipeline over the same row.
  if (project.status === ProjectStatus.GENERATING) {
    const ageMs = Date.now() - new Date(project.updatedAt).getTime();
    if (ageMs < 2 * 60_000) throw new GenerationInProgressError();
  }

  const template = await getTemplateById(templateId);
  if (!template) throw new NoTemplateError();

  const answers = parseQuestionnaireAnswers(project.questionnaire.answers);
  const designVersion = project.designVersion + 1;

  return runGeneration({
    userId,
    projectId,
    template,
    answers,
    spendKey: `heavy_generate:${projectId}:v${designVersion}`,
    designVersion,
    existingLogoUrl: readThemeLogoUrl(project.theme),
    // Paying for the website is separate from choosing its look, so a redesign
    // never pushes the user back behind the paywall they already cleared.
    keepPaidStatus: PAID_STATUSES.has(project.status),
  });
}

/** Statuses that mean the website itself has already been bought. */
const PAID_STATUSES = new Set<string>([
  ProjectStatus.PAID,
  ProjectStatus.EXPORTED,
  ProjectStatus.DEPLOYING,
  ProjectStatus.LIVE,
]);

/**
 * The shared pipeline: spend credits, ask the model for copy, snap it onto the
 * locked layout, then persist and back up. Refunds and marks the project FAILED
 * if anything throws.
 */
async function runGeneration(params: {
  userId: string;
  projectId: string;
  template: SiteTemplate;
  answers: QuestionnaireAnswers;
  spendKey: string;
  designVersion?: number;
  keepPaidStatus?: boolean;
  /** A logo already on the project — an editor upload, or an earlier import. */
  existingLogoUrl?: string;
}): Promise<GenerateResult> {
  const {
    userId,
    projectId,
    template,
    answers,
    spendKey,
    designVersion,
    keepPaidStatus,
    existingLogoUrl,
  } = params;

  const requirements = analyzeRequirements(answers, template);
  const cost = env.credits.costHeavyGenerate;

  // Spend credits up-front (idempotent per attempt); refund on hard failure.
  const { balanceAfter } = await assertAndSpend({
    userId,
    amount: cost,
    reason: CreditLedgerReason.HEAVY_GENERATE,
    projectId,
    idempotencyKey: spendKey,
  });

  await prisma.project.update({
    where: { id: projectId },
    data: {
      status: ProjectStatus.GENERATING,
      ...(designVersion ? { designVersion } : {}),
    },
  });

  try {
    const provider = getAiProvider();
    const { result: generated, events } = await withUsageCapture(() =>
      provider.generateBlueprint(requirements)
    );
    // Meter tokens right after the model call so usage is recorded even if a
    // later step fails (and credits get refunded).
    await persistUsageEvents({ userId, projectId, operation: "heavy_generate", events });
    let blueprint = generated;

    // The model only writes copy — snap its output back onto the locked layout.
    blueprint = conformToTemplate(blueprint, requirements);
    blueprint = sanitizeBlueprint(blueprint);
    const qa = runQa(blueprint, requirements.contact);

    // Theme precedence: an imported identity the customer chose to keep beats
    // the model's typeface and palette picks, which are themselves only used
    // when the questionnaire left the colours alone.
    const theme = createTheme(requirements.colorPreference, requirements.visualStyle, {
      choice: validateThemeChoice(blueprint.design),
      colorPreferenceExplicit: requirements.colorPreferenceExplicit,
      imported: requirements.useImportedTheme
        ? {
            colors: requirements.importedBrand?.colors,
            fontFamily: requirements.importedBrand?.fontFamily,
          }
        : undefined,
    });

    // A logo is the business's own property rather than a style choice, so an
    // imported mark applies under either theme; a mark the user set in the
    // editor outranks it and survives a redesign.
    const logoUrl = existingLogoUrl ?? requirements.importedBrand?.logoUrl;
    if (logoUrl) theme.logoUrl = logoUrl;

    blueprint = selectIcons(blueprint);
    blueprint = await sourceImages(blueprint, { clientImages: requirements.importedBrand });
    const site = {
      ...assembleSite(blueprint, theme),
      contact: requirements.contact,
      renderer: template.renderer,
      templateSlug: template.slug,
    };

    await prisma.project.update({
      where: { id: projectId },
      data: {
        businessName: requirements.business.name,
        slug: slugify(requirements.business.name),
        templateId: template.id,
        blueprint: JSON.stringify(blueprint),
        assembledPages: JSON.stringify(site),
        theme: JSON.stringify(theme),
        status: keepPaidStatus ? ProjectStatus.PAID : ProjectStatus.GENERATED,
        githubSyncStatus: GithubSyncStatus.PENDING,
      },
    });

    if (designVersion) await settleAfterRedesign(projectId, Boolean(keepPaidStatus));

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

/**
 * A new design can change the billable feature set and always invalidates
 * what is currently deployed. An unpaid quote is dropped so it gets recomputed;
 * a paid one stands, and only the deployment is flagged for a refresh.
 */
async function settleAfterRedesign(projectId: string, paid: boolean): Promise<void> {
  if (!paid) {
    await prisma.quote.deleteMany({ where: { projectId } });
  }

  // Keep liveUrl so the old site stays reachable until the user redeploys.
  await prisma.deployment.updateMany({
    where: { projectId },
    data: { status: DeploymentStatus.PENDING },
  });
}

export { InsufficientCreditsError };
