import { assignImportedImages } from "@/lib/agents/imported-images";
import { assembleSite } from "@/lib/agents/section-assembly";
import { resolveConsentedAssets } from "@/lib/branding/asset-consent";
import { parseAssetConsent, parseImportedBrand } from "@/lib/branding/imported-brand";
import { prisma } from "@/lib/prisma";
import { parseQuestionnaireAnswers } from "@/lib/questionnaire/schema";
import type { AssembledSite, ThemeTokens, WebsiteBlueprint } from "@/lib/blueprint/types";

type PhotoProject = {
  id: string;
  blueprint: WebsiteBlueprint | null;
  assembledPages: AssembledSite | null;
  theme: ThemeTokens | null;
};

/**
 * Puts photographs saved from the customer's own website into the design.
 * Runs when a site is opened, downloaded, or published, so an earlier generate
 * that filled the page with stock or template photos still shows their pictures.
 */
export async function withCustomerPhotos<T extends PhotoProject>(project: T): Promise<T> {
  if (!project.blueprint) return project;

  const row = await prisma.questionnaire.findUnique({
    where: { projectId: project.id },
    select: { answers: true },
  });
  if (!row?.answers) return project;

  let answers;
  try {
    answers = parseQuestionnaireAnswers(row.answers);
  } catch {
    return project;
  }
  if (answers.hasWebsite !== "yes") return project;

  const assets = resolveConsentedAssets({
    brand: parseImportedBrand(answers.importedBrand),
    consent: parseAssetConsent(answers.importedAssetConsent),
    projectId: project.id,
  });
  if (!assets.images.length) return project;

  const blueprint = structuredClone(project.blueprint);
  assignImportedImages(blueprint, assets.images);

  const theme = project.theme ?? project.assembledPages?.theme;
  if (!theme) return { ...project, blueprint };

  const assembled = assembleSite(blueprint, theme);
  const site: AssembledSite = project.assembledPages
    ? {
        ...project.assembledPages,
        pages: assembled.pages,
        businessName: assembled.businessName ?? project.assembledPages.businessName,
        seo: assembled.seo,
      }
    : assembled;

  return { ...project, blueprint, assembledPages: site };
}
