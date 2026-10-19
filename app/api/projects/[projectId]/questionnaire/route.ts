import { requireUser, jsonOk, jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getOwnedProject } from "@/lib/projects/projects";
import { CrmScoreAction } from "@/lib/crm/config";
import { awardOneTimeAction } from "@/lib/crm/scoring";
import { enqueueDealSyncForUser, scheduleCrmDrain } from "@/lib/crm/sync";
import { questionnaireSchema } from "@/lib/questionnaire/schema";
import {
  ASSET_CONSENT_REQUIRED,
  parseImportedBrand,
  parseAssetConsent,
  importedAssetPaths,
  needsImportedAssetConsent,
} from "@/lib/branding/imported-brand";
import { isProjectImportPath, recordAssetConsent } from "@/lib/branding/asset-consent";
import { getTemplateById, getTemplateBySlug } from "@/lib/templates/store";
import { slugify } from "@/lib/utils";
import { clampSiteLayout } from "@/lib/agents/site-layout";

type Ctx = { params: Promise<{ projectId: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { projectId } = await params;

  const project = await getOwnedProject(user.id, projectId);
  if (!project) return jsonError("We couldn't find that website project.", 404);

  const q = await prisma.questionnaire.findUnique({ where: { projectId } });
  return jsonOk({ answers: q ? JSON.parse(q.answers) : null });
}

export async function POST(req: Request, { params }: Ctx) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { projectId } = await params;

  const project = await getOwnedProject(user.id, projectId);
  if (!project) return jsonError("We couldn't find that website project.", 404);

  const body = await readJson<unknown>(req);
  const parsed = questionnaireSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Please check your answers and try again.", 400, "VALIDATION", parsed.error.flatten());
  }

  const answers = parsed.data;

  // The design is locked to a published template row; never trust the client id.
  const template =
    (await getTemplateById(answers.templateId)) ?? (await getTemplateBySlug(answers.templateId));
  if (!template || !template.published) {
    return jsonError("Choose a design first", 400, "TEMPLATE_REQUIRED");
  }
  answers.templateId = template.id;
  if (answers.layout?.length) {
    answers.layout = clampSiteLayout(template.pages, answers.layout);
  }

  const existing = await prisma.questionnaire.findUnique({ where: { projectId } });
  const prev = existing ? (JSON.parse(existing.answers) as Record<string, unknown>) : {};
  const storedBrand = parseImportedBrand(prev.importedBrand);
  const clientBrand = parseImportedBrand(answers.importedBrand);
  const brand =
    storedBrand ??
    (clientBrand &&
    importedAssetPaths(clientBrand).every((path) => isProjectImportPath(path, projectId))
      ? clientBrand
      : clientBrand && importedAssetPaths(clientBrand).length === 0
        ? clientBrand
        : null);

  if (answers.importedThemeChoice === "imported" && !brand) {
    answers.importedThemeChoice = "";
  }

  answers.importedBrand = brand ?? undefined;
  const clientConsent = answers.importedAssetConsent;
  if (needsImportedAssetConsent(brand, clientConsent)) {
    return jsonError(ASSET_CONSENT_REQUIRED, 400, "ASSET_CONSENT_REQUIRED");
  }
  answers.importedAssetConsent = recordAssetConsent({
    granted: Boolean(clientConsent?.granted),
    brand,
    previous: parseAssetConsent(prev.importedAssetConsent),
  });

  await prisma.$transaction([
    prisma.questionnaire.upsert({
      where: { projectId },
      create: { projectId, answers: JSON.stringify(answers) },
      update: { answers: JSON.stringify(answers) },
    }),
    prisma.project.update({
      where: { id: projectId },
      data: {
        businessName: answers.businessName,
        slug: slugify(answers.businessName),
        templateId: template.id,
      },
    }),
  ]);

  // Scored only once the full schema validated and saved. Answers typed by hand
  // and answers filled in by the scraper both land here, and both award the
  // same single event — doing it both ways is worth one award, not two.
  try {
    await awardOneTimeAction(user.id, CrmScoreAction.QUESTIONNAIRE_COMPLETED);
    // Open (or refresh) the HubSpot deal with the full questionnaire.
    await enqueueDealSyncForUser(user.id, projectId);
    scheduleCrmDrain();
  } catch (err) {
    console.error("[crm] questionnaire score failed:", err instanceof Error ? err.message : err);
  }

  return jsonOk({ ok: true });
}
