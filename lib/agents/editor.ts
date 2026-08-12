import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { CreditLedgerReason } from "@/lib/constants";
import { assertAndSpend } from "@/lib/credits/credits";
import { validateBlueprint } from "@/lib/blueprint/schema";
import { assembleSite } from "@/lib/agents/section-assembly";
import { sanitizeBlueprint, sanitizeText } from "@/lib/agents/security";
import { getAiProvider, type SectionContent } from "@/lib/ai/provider";
import { sourceImages } from "@/lib/agents/image-sourcing";
import { trySyncProjectToGitHub } from "@/lib/github/github";
import { getTemplateById } from "@/lib/templates/store";
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

async function loadBlueprint(projectId: string): Promise<{ blueprint: WebsiteBlueprint; theme: ThemeTokens }> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project?.blueprint) throw new Error("Project not generated");
  const blueprint = JSON.parse(project.blueprint) as WebsiteBlueprint;
  const theme = project.theme ? (JSON.parse(project.theme) as ThemeTokens) : ({} as ThemeTokens);
  return { blueprint, theme };
}

async function persistAndSync(
  projectId: string,
  blueprint: WebsiteBlueprint,
  theme: ThemeTokens
): Promise<void> {
  const clean = sanitizeBlueprint(blueprint);
  const withImages = await sourceImages(clean);
  const metadata = await siteMetadata(projectId);
  const site = { ...assembleSite(withImages, theme), ...metadata };
  await prisma.project.update({
    where: { id: projectId },
    data: {
      blueprint: JSON.stringify(withImages),
      assembledPages: JSON.stringify(site),
      theme: JSON.stringify(theme),
    },
  });
  // Keep the GitHub backup in sync on every save (best-effort).
  await trySyncProjectToGitHub(projectId);
}

/**
 * Site-level metadata that lives outside the blueprint: which renderer draws the
 * site, and the business's contact details. Reassembling on every save would
 * otherwise drop a bespoke design back to the generic section renderer and lose
 * the contact details that designs without a contact block rely on.
 */
async function siteMetadata(
  projectId: string
): Promise<{ renderer?: string; templateSlug?: string; contact?: SiteContact }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { templateId: true, assembledPages: true, questionnaire: true },
  });
  if (!project) return {};

  let existing: AssembledSite | null = null;
  try {
    existing = project.assembledPages
      ? (JSON.parse(project.assembledPages) as AssembledSite)
      : null;
  } catch {
    // A corrupt cache is not worth failing a save over.
  }

  const contact = project.questionnaire
    ? contactFromQuestionnaire(project.questionnaire.answers)
    : existing?.contact;

  if (project.templateId) {
    const template = await getTemplateById(project.templateId);
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
 * validates against the registry, reassembles, persists, and syncs GitHub. The
 * template's section list is enforced here so no client can restructure a
 * finished design.
 */
export async function saveProjectContent(params: {
  projectId: string;
  blueprint: WebsiteBlueprint;
  theme: ThemeTokens;
}): Promise<void> {
  const result = validateBlueprint(params.blueprint);
  if (!result.valid) throw new BlueprintInvalidError(result.errors);
  await assertMatchesTemplate(params.projectId, result.blueprint);
  await persistAndSync(params.projectId, result.blueprint, params.theme);
}

/** Rejects saves that add, remove, reorder, or swap any of the locked slots. */
async function assertMatchesTemplate(
  projectId: string,
  blueprint: WebsiteBlueprint
): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { templateId: true },
  });
  if (!project?.templateId) return;

  const template = await getTemplateById(project.templateId);
  if (!template) return;

  const incoming = blueprint.pages.flatMap((page) => page.sections.map((s) => s.variant));
  const expected = template.sections;
  const matches =
    incoming.length === expected.length && incoming.every((v, i) => v === expected[i]);

  if (!matches) {
    throw new TemplateStructureError(
      `The ${template.name} design has a fixed layout. Edit the content of its sections instead of changing their order or number.`
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

  const { blueprint, theme } = await loadBlueprint(projectId);
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

  const provider = getAiProvider();
  const updated = await provider.reviseSection({
    section,
    instruction: cleanInstruction,
    brandTone: blueprint.design.tone,
  });

  section.content = updated;
  await persistAndSync(projectId, blueprint, theme);

  return { content: updated, balanceAfter };
}
