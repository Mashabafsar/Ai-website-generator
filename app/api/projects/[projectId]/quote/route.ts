import { requireUser, jsonOk, jsonError, readJson } from "@/lib/http";
import { getOwnedProject } from "@/lib/projects/projects";
import { generateAndSaveQuote } from "@/lib/quote/quote";
import { isPackageType, ProjectStatus } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ projectId: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { projectId } = await params;

  const project = await getOwnedProject(user.id, projectId);
  if (!project) return jsonError("We couldn't find that website project.", 404);
  if (!project.blueprint) return jsonError("Write your website first", 409, "NOT_GENERATED");

  const body = await readJson<{ packageType?: unknown }>(req);
  const packageType = isPackageType(body?.packageType) ? body.packageType : undefined;

  try {
    const quote = await generateAndSaveQuote(projectId, packageType);
    // Advance status to QUOTED (but never downgrade a paid/live project).
    if (project.status === ProjectStatus.GENERATED) {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.QUOTED },
      });
    }
    return jsonOk(quote);
  } catch (err) {
    console.error("Quote error:", err);
    return jsonError("We couldn't calculate the price.", 500);
  }
}
