import { requireUser, jsonOk, jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getOwnedProject } from "@/lib/projects/projects";
import { questionnaireSchema } from "@/lib/questionnaire/schema";
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

  await prisma.$transaction([
    prisma.questionnaire.upsert({
      where: { projectId },
      create: { projectId, answers: JSON.stringify(answers) },
      update: { answers: JSON.stringify(answers) },
    }),
    prisma.project.update({
      where: { id: projectId },
      data: { businessName: answers.businessName, slug: slugify(answers.businessName) },
    }),
  ]);

  return jsonOk({ ok: true });
}
