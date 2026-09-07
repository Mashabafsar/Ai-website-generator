import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import {
  ProjectStatus,
  PAID_PROJECT_STATUSES,
  GithubSyncStatus,
  CreditLedgerReason,
  DeploymentStatus,
} from "@/lib/constants";
import {
  assertAndSpend,
  refundSpend,
  getBalance,
  InsufficientCreditsError,
} from "@/lib/credits/credits";
import { parseQuestionnaireAnswers, type QuestionnaireAnswers } from "@/lib/questionnaire/schema";
import type { SiteTemplate } from "@/lib/templates/types";
import { analyzeRequirements } from "@/lib/agents/requirement-analyst";
import { createTheme, validateThemeChoice } from "@/lib/agents/theme";
import { selectIcons } from "@/lib/agents/icon-selection";
import { sourceImages } from "@/lib/agents/image-sourcing";
import { parseImportedBrand, parseAssetConsent, hasImportedTheme } from "@/lib/branding/imported-brand";
import { resolveConsentedAssets } from "@/lib/branding/asset-consent";
import { THEME_FONTS } from "@/templates/shared/fonts";
import { assembleSite } from "@/lib/agents/section-assembly";
import { sanitizeBlueprint } from "@/lib/agents/security";
import { conformToTemplate } from "@/lib/agents/template-fill";
import { getTemplateById } from "@/lib/templates/store";
import { runQa, type QaReport } from "@/lib/agents/qa";
import { getAiProvider } from "@/lib/ai/provider";
import { withUsageCapture } from "@/lib/ai/usage";
import { persistUsageEvents } from "@/lib/ai/usage-record";
import { newFailureLog, withAiDiagnostics } from "@/lib/ai/diagnostics";
import { recordAiIncidents } from "@/lib/ai/incidents";
import type { AiFailure } from "@/lib/ai/failure";
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
  /** True when no model answered and the deterministic template wrote the copy. */
  fromTemplate: boolean;
  /** Credits returned because the build was not model-written. */
  refunded: number;
  /** Why each real provider dropped out, for the operator and the API caller. */
  providerFailures: { provider: string; model: string; kind: string }[];
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

  // A template-built site was refunded rather than sold, so the customer is
  // still owed the generation they paid for and may run it again.
  const owedAnotherAttempt = project.generationDegraded && !PAID_STATUSES.has(project.status);

  if (
    project.blueprint &&
    !owedAnotherAttempt &&
    project.status !== ProjectStatus.DRAFT &&
    project.status !== ProjectStatus.FAILED
  ) {
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
    spendKey: await nextGenerationSpendKey(projectId),
  });
}

/**
 * Reusing one key across attempts makes every retry free: the original spend row
 * still satisfies the idempotency check even after it has been refunded.
 * Counting the spends already booked against the project gives each attempt its
 * own key while still collapsing concurrent duplicates of one attempt into a
 * single charge.
 */
async function nextGenerationSpendKey(projectId: string): Promise<string> {
  const attempts = await prisma.creditLedger.count({
    where: { projectId, reason: CreditLedgerReason.HEAVY_GENERATE },
  });
  return attempts === 0
    ? `heavy_generate:${projectId}`
    : `heavy_generate:${projectId}:a${attempts}`;
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
    // Paying for the website is separate from choosing its look, so a redesign
    // never pushes the user back behind the paywall they already cleared.
    keepPaidStatus: PAID_STATUSES.has(project.status),
  });
}

const MOCK_MODE_REASON =
  "AI_USE_MOCK is enabled, so the deterministic template built this site without calling a model.";

function summarizeFailure(failure: AiFailure) {
  return { provider: failure.provider, model: failure.model, kind: failure.kind };
}

const PAID_STATUSES = PAID_PROJECT_STATUSES;

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
}): Promise<GenerateResult> {
  const { userId, projectId, template, answers, spendKey, designVersion, keepPaidStatus } = params;

  const requirements = analyzeRequirements(answers, template);
  const cost = env.credits.costHeavyGenerate;

  // Spend credits up-front (idempotent per attempt); refund on hard failure.
  // A replay of the same key must not refund — that charge belongs to the
  // in-flight request that actually spent.
  const { balanceAfter, spent } = await assertAndSpend({
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

  const failureLog = newFailureLog();
  let incidentsLogged = false;

  try {
    const provider = getAiProvider();
    const { result: generated, events } = await withUsageCapture(() =>
      withAiDiagnostics(failureLog, () => provider.generateBlueprint(requirements))
    );
    // Meter tokens right after the model call so usage is recorded even if a
    // later step fails (and credits get refunded).
    await persistUsageEvents({ userId, projectId, operation: "heavy_generate", events });

    // The deterministic template is the one provider that cannot fail, so its
    // appearance in the meter is the authoritative record that no model wrote
    // this site — whatever the chain reported on the way there.
    const fromTemplate = events.some((e) => e.provider === "mock");
    await recordAiIncidents({
      userId,
      projectId,
      operation: "heavy_generate",
      failures: failureLog.failures,
      templateFallback: fromTemplate,
      fallbackReason: fromTemplate && env.ai.useMock ? MOCK_MODE_REASON : undefined,
    });
    incidentsLogged = true;

    // Template copy is not the product the customer asked for, so it is given
    // away rather than sold. The refund lands before the rest of the pipeline
    // so the balance is already correct if a later step throws.
    let refunded = 0;
    let finalBalance = balanceAfter;
    if (fromTemplate && spent) {
      await refundSpend({ userId, amount: cost, projectId, spendIdempotencyKey: spendKey });
      refunded = cost;
      finalBalance = await getBalance(userId);
    }

    let blueprint = generated;

    // The model only writes copy — snap its output back onto the locked layout.
    blueprint = conformToTemplate(blueprint, requirements);
    blueprint = sanitizeBlueprint(blueprint);
    const qa = runQa(blueprint, requirements.contact);

    const brand = answers.hasWebsite === "yes" ? parseImportedBrand(answers.importedBrand) : null;
    const assets = resolveConsentedAssets({
      brand,
      consent: parseAssetConsent(answers.importedAssetConsent),
      projectId,
    });
    const useImportedLook =
      answers.importedThemeChoice === "imported" && hasImportedTheme(brand);
    const modelChoice = validateThemeChoice(blueprint.design);
    const pickedFont = THEME_FONTS.some((f) => f.id === answers.fontFamily)
      ? answers.fontFamily
      : undefined;

    const theme = createTheme(requirements.colorPreference, requirements.visualStyle, {
      choice: {
        palette: useImportedLook ? undefined : modelChoice.palette,
        fontFamily: useImportedLook ? undefined : pickedFont || modelChoice.fontFamily,
      },
      colorPreferenceExplicit: useImportedLook ? false : requirements.colorPreferenceExplicit,
      importedColors: useImportedLook ? brand?.colors : undefined,
      importedFontFamily: useImportedLook ? brand?.fontFamily : pickedFont,
      logoUrl: assets.logoUrl,
      tone: requirements.tone,
      customColors: useImportedLook ? undefined : requirements.customColors,
    });
    blueprint = selectIcons(blueprint);
    blueprint = await sourceImages(blueprint, assets.images);
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
        generationDegraded: fromTemplate,
      },
    });

    if (designVersion) await settleAfterRedesign(projectId, Boolean(keepPaidStatus));

    // Always back up to GitHub (payment-independent). Best-effort; won't throw.
    await trySyncProjectToGitHub(projectId);

    return {
      status: "GENERATED",
      qa,
      balanceAfter: finalBalance,
      fromTemplate,
      refunded,
      providerFailures: failureLog.failures.map(summarizeFailure),
    };
  } catch (err) {
    // A chain that died before it could report still has to explain itself:
    // what it learned on the way down is the only account of what went wrong.
    if (!incidentsLogged) {
      await recordAiIncidents({
        userId,
        projectId,
        operation: "heavy_generate",
        failures: failureLog.failures,
      });
    }
    // Refund the spend and mark the project failed so the user can retry.
    if (spent) {
      await refundSpend({ userId, amount: cost, projectId, spendIdempotencyKey: spendKey });
    }
    await prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.FAILED, generationDegraded: false },
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
