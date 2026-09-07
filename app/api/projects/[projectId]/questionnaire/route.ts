import { requireUser, jsonOk, jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getOwnedProject } from "@/lib/projects/projects";
import { questionnaireSchema } from "@/lib/questionnaire/schema";
import {
  parseImportedBrand,
  parseAssetConsent,
  importedAssetPaths,
} from "@/lib/branding/imported-brand";
import { isProjectImportPath, recordAssetConsent } from "@/lib/branding/asset-consent";
import { getTemplateById, getTemplateBySlug } from "@/lib/templates/store";
import { slugify } from "@/lib/utils";

type Ctx = { params: Promise<{ projectId: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { projectId } = await params;

  const project = await getOwnedProject(user.id, projectId);
  if (!project) return jsonError("Project not found", 404);

  const q = await prisma.questionnaire.findUnique({ where: { projectId } });
  return jsonOk({ answers: q ? JSON.parse(q.answers) : null });
}

export async function POST(req: Request, { params }: Ctx) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { projectId } = await params;

  const project = await getOwnedProject(user.id, projectId);
  if (!project) return jsonError("Project not found", 404);

  const body = await readJson<unknown>(req);
  const parsed = questionnaireSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid questionnaire", 400, "VALIDATION", parsed.error.flatten());
  }

  const answers = parsed.data;

  // The design is locked to a published template row; never trust the client id.
  const template =
    (await getTemplateById(answers.templateId)) ?? (await getTemplateBySlug(answers.templateId));
  if (!template || !template.published) {
    return jsonError("Select a design from the template library", 400, "TEMPLATE_REQUIRED");
  }
  answers.templateId = template.id;

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
  answers.importedAssetConsent = recordAssetConsent({
    granted: Boolean(answers.importedAssetConsent?.granted),
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

  return jsonOk({ ok: true });
}
