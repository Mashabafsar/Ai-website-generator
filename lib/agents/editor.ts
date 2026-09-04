import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { CreditLedgerReason } from "@/lib/constants";
import { assertAndSpend } from "@/lib/credits/credits";
import { validateBlueprint } from "@/lib/blueprint/schema";
import { assembleSite } from "@/lib/agents/section-assembly";
import { sanitizeBlueprint, sanitizeText } from "@/lib/agents/security";
import { getAiProvider, type SectionContent } from "@/lib/ai/provider";
import { withUsageCapture } from "@/lib/ai/usage";
import { persistUsageEvents } from "@/lib/ai/usage-record";
import { sourceImages } from "@/lib/agents/image-sourcing";
import { trySyncProjectToGitHub } from "@/lib/github/github";
import { getTemplateById } from "@/lib/templates/store";
import { findTemplateLockViolation } from "@/lib/templates/lock";
import { parseQuestionnaireAnswers } from "@/lib/questionnaire/schema";
import { analyzeRequirements } from "@/lib/agents/requirement-analyst";
import type {
  AssembledSite,
  SiteContact,
  WebsiteBlueprint,
  ThemeTokens,
} from "@/lib/blueprint/types";

export class BlueprintInvalidError extends Error {
  errors: string[];
  constructor(errors: string[]) {
    super("Invalid blueprint");
    this.name = "BlueprintInvalidError";
    this.errors = errors;
  }
}

/** Raised when an edit targets a section that isn't part of the site. */
export class SectionNotFoundError extends Error {
  constructor() {
    super("Section not found");
    this.name = "SectionNotFoundError";
  }
}

/** Raised when an edit would change a fixed template's locked layout. */
export class TemplateStructureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TemplateStructureError";
  }
}

/** Everything a save needs from the row: the locked layout, the stored content
 *  to diff against, the cached assembly, and the contact details. */
type StoredProject = {
  templateId: string | null;
  blueprint: string | null;
  assembledPages: string | null;
  theme: string | null;
  questionnaire: { answers: string } | null;
};

async function loadStoredProject(projectId: string): Promise<StoredProject> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      templateId: true,
      blueprint: true,
      assembledPages: true,
      theme: true,
      questionnaire: { select: { answers: true } },
    },
  });
  if (!project) throw new Error("Project not found");
  return project;
}

function parseStored(stored: StoredProject): { blueprint: WebsiteBlueprint; theme: ThemeTokens } {
  if (!stored.blueprint) throw new Error("Project not generated");
  const blueprint = JSON.parse(stored.blueprint) as WebsiteBlueprint;
  const theme = stored.theme ? (JSON.parse(stored.theme) as ThemeTokens) : ({} as ThemeTokens);
  return { blueprint, theme };
}

/** Reassembles and writes. `blueprint` must already be sanitized. */
async function persist(
  projectId: string,
  stored: StoredProject,
  blueprint: WebsiteBlueprint,
  theme: ThemeTokens
): Promise<void> {
  const site = { ...assembleSite(blueprint, theme), ...(await siteMetadata(stored)) };
  await prisma.project.update({
    where: { id: projectId },
    data: {
      blueprint: JSON.stringify(blueprint),
      assembledPages: JSON.stringify(site),
      theme: JSON.stringify(theme),
    },
  });
}

/** Full save: new copy needs new photos, and the GitHub backup follows it. */
async function persistAndSync(
  projectId: string,
  stored: StoredProject,
  blueprint: WebsiteBlueprint,
  theme: ThemeTokens
): Promise<boolean> {
  const withImages = await sourceImages(blueprint);
  await persist(projectId, stored, withImages, theme);
  return trySyncProjectToGitHub(projectId);
}

/**
 * Site-level metadata that lives outside the blueprint: which renderer draws the
 * site, and the business's contact details. Reassembling on every save would
 * otherwise drop a bespoke design back to the generic section renderer and lose
 * the contact details that designs without a contact block rely on.
 */
async function siteMetadata(
  stored: StoredProject
): Promise<{ renderer?: string; templateSlug?: string; contact?: SiteContact }> {
  let existing: AssembledSite | null = null;
  try {
    existing = stored.assembledPages
      ? (JSON.parse(stored.assembledPages) as AssembledSite)
      : null;
  } catch {
    // A corrupt cache is not worth failing a save over.
  }

  const contact = stored.questionnaire
    ? contactFromQuestionnaire(stored.questionnaire.answers)
    : existing?.contact;

  if (stored.templateId) {
    const template = await getTemplateById(stored.templateId);
    if (template) {
      return { renderer: template.renderer, templateSlug: template.slug, contact };
    }
  }

  // Projects generated before a template was attached keep whatever was stored.
  if (existing?.renderer) {
    return { renderer: existing.renderer, templateSlug: existing.templateSlug, contact };
  }
  return { contact };
}

function contactFromQuestionnaire(answers: string): SiteContact | undefined {
  try {
    const parsed = JSON.parse(answers) as {
      contactEmail?: string;
      contactPhone?: string;
      location?: string;
    };
    const email = parsed.contactEmail?.trim() || undefined;
    const phone = parsed.contactPhone?.trim() || undefined;
    const address = parsed.location?.trim() || undefined;
    return email || phone || address ? { email, phone, address } : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Manual editor save (no AI, free). Accepts a full edited blueprint + theme,
 * validates against the registry, reassembles and persists. The template's
 * section list is enforced here so no client can restructure a finished design.
 *
 * `githubSyncPending` means the repo has not been brought up to date yet and the
 * caller still owes it a commit.
 */
export async function saveProjectContent(params: {
  projectId: string;
  blueprint: WebsiteBlueprint;
  theme: ThemeTokens;
}): Promise<{ githubSynced: boolean; githubSyncPending: boolean }> {
  const result = validateBlueprint(params.blueprint);
  if (!result.valid) throw new BlueprintInvalidError(result.errors);

  const stored = await loadStoredProject(params.projectId);
  await assertMatchesTemplate(stored, result.blueprint);

  const clean = sanitizeBlueprint(result.blueprint);

  // Identical content means every stock-photo query and every word the repo
  // would commit is unchanged, so only the theme can have moved. Decided from
  // the stored row rather than a flag on the request, because a client that
  // could assert "theme only" could also skip the image and commit work while
  // smuggling new copy through.
  if (matchesStoredContent(stored, clean)) {
    await persist(params.projectId, stored, clean, params.theme);
    return { githubSynced: false, githubSyncPending: true };
  }

  const githubSynced = await persistAndSync(params.projectId, stored, clean, params.theme);
  return { githubSynced, githubSyncPending: false };
}

/** Key order carries no meaning in the stored JSON, so compare a sorted form. */
function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, val) =>
    val && typeof val === "object" && !Array.isArray(val)
      ? Object.fromEntries(
          Object.keys(val as Record<string, unknown>)
            .sort()
            .map((k) => [k, (val as Record<string, unknown>)[k]])
        )
      : val
  );
}

function matchesStoredContent(stored: StoredProject, blueprint: WebsiteBlueprint): boolean {
  if (!stored.blueprint) return false;
  try {
    return canonicalJson(JSON.parse(stored.blueprint)) === canonicalJson(blueprint);
  } catch {
    return false;
  }
}

/** Rejects saves that add, remove, reorder, or swap any of the locked slots. */
async function assertMatchesTemplate(
  stored: StoredProject,
  blueprint: WebsiteBlueprint
): Promise<void> {
  if (!stored.templateId) return;

  const template = await getTemplateById(stored.templateId);
  if (!template) return;

  const violation = findTemplateLockViolation(template.pages, blueprint);
  if (violation) {
    throw new TemplateStructureError(
      `The ${template.name} design has a fixed layout. Edit the content of its sections instead of changing their pages, order, or number.`
    );
  }
}

/**
 * Lightweight AI edit of a single section. Spends credits, revises only the
 * targeted section, sanitizes, reassembles, persists, and syncs GitHub.
 */
export async function editSectionWithAi(params: {
  userId: string;
  projectId: string;
  pageSlug: string;
  sectionId: string;
  instruction: string;
}): Promise<{ content: SectionContent; balanceAfter: number }> {
  const { userId, projectId, pageSlug, sectionId, instruction } = params;

  const stored = await loadStoredProject(projectId);
  const { blueprint, theme } = parseStored(stored);
  const page = blueprint.pages.find((p) => p.slug === pageSlug);
  const section = page?.sections.find((s) => s.id === sectionId);
  if (!section) throw new SectionNotFoundError();

  const cleanInstruction = sanitizeText(instruction).slice(0, 300);

  // Spend credits per edit (idempotent per section+instruction hash to avoid
  // accidental double-charge on quick double-clicks within the same request).
  const key = `light_edit:${projectId}:${sectionId}:${Date.now()}`;
  const { balanceAfter } = await assertAndSpend({
    userId,
    amount: env.credits.costLightEdit,
    reason: CreditLedgerReason.LIGHT_EDIT,
    projectId,
    idempotencyKey: key,
  });

  const brandTone = await resolveBrandTone(projectId, blueprint.design.tone);

  const provider = getAiProvider();
  const { result: updated, events } = await withUsageCapture(() =>
    provider.reviseSection({
      section,
      instruction: cleanInstruction,
      brandTone,
    })
  );
  await persistUsageEvents({ userId, projectId, operation: "light_edit", events });

  section.content = updated;
  await persistAndSync(projectId, stored, sanitizeBlueprint(blueprint), theme);

  return { content: updated, balanceAfter };
}

/** Prefer the questionnaire override, then the template, then the stored blueprint tone. */
async function resolveBrandTone(projectId: string, fallback: string): Promise<string> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { templateId: true, questionnaire: true },
  });
  if (!project?.questionnaire || !project.templateId) return fallback;
  const template = await getTemplateById(project.templateId);
  if (!template) return fallback;
  const answers = parseQuestionnaireAnswers(project.questionnaire.answers);
  return analyzeRequirements(answers, template).tone || fallback;
}
