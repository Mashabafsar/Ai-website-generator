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
import { getVariantSpec } from "@/lib/sections/registry";
import { shortId } from "@/lib/utils";
import type { WebsiteBlueprint, ThemeTokens } from "@/lib/blueprint/types";

export class BlueprintInvalidError extends Error {
  errors: string[];
  constructor(errors: string[]) {
    super("Invalid blueprint");
    this.name = "BlueprintInvalidError";
    this.errors = errors;
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
  const site = assembleSite(withImages, theme);
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
 * Manual editor save (no AI, free). Accepts a full edited blueprint + theme,
 * validates against the registry, reassembles, persists, and syncs GitHub.
 */
export async function saveProjectContent(params: {
  projectId: string;
  blueprint: WebsiteBlueprint;
  theme: ThemeTokens;
}): Promise<void> {
  const result = validateBlueprint(params.blueprint);
  if (!result.valid) throw new BlueprintInvalidError(result.errors);
  await persistAndSync(params.projectId, result.blueprint, params.theme);
}

/** Add a new section (from the registry) with default content to a page. */
export async function addSection(params: {
  projectId: string;
  pageSlug: string;
  variant: string;
  requirementsName?: string;
}): Promise<void> {
  const { projectId, pageSlug, variant } = params;
  const spec = getVariantSpec(variant);
  if (!spec) throw new Error("Unknown variant");

  const { blueprint, theme } = await loadBlueprint(projectId);
  const page = blueprint.pages.find((p) => p.slug === pageSlug);
  if (!page) throw new Error("Page not found");

  const ctx = {
    businessName: blueprint.business.name,
    industry: blueprint.business.industry,
    description: blueprint.business.description,
    audience: "your customers",
    services: [],
    tone: blueprint.design.tone,
    location: blueprint.business.location,
  };

  // Insert before the footer if present.
  const footerIdx = page.sections.findIndex((s) => s.type === "footer");
  const newSection = {
    id: shortId(spec.type),
    type: spec.type,
    variant: spec.variant,
    content: spec.defaults(ctx),
    imageKeywords: spec.needsImage ? spec.keywords(ctx) : undefined,
    selectedImage: null,
  };
  if (footerIdx >= 0) page.sections.splice(footerIdx, 0, newSection);
  else page.sections.push(newSection);

  await persistAndSync(projectId, blueprint, theme);
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
  if (!section) throw new Error("Section not found");

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
