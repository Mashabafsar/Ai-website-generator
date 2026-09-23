import { requireUser, jsonError } from "@/lib/http";
import { getOwnedProject, parseProject } from "@/lib/projects/projects";
import { hasPaidPackage } from "@/lib/payments/access";
import { generateProjectFiles } from "@/lib/export/generate-project";
import { filesToZip } from "@/lib/export/zip";
import { slugify } from "@/lib/utils";
import { ProjectStatus } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { notifyOwnerZipReady } from "@/lib/notify/owner";

type Ctx = { params: Promise<{ projectId: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { projectId } = await params;

  const raw = await getOwnedProject(user.id, projectId);
  if (!raw) return jsonError("We couldn't find that website project.", 404);

  // Payment-gated: ZIP export requires a completed website-package payment.
  const paid = await hasPaidPackage(projectId);
  if (!paid) {
    return jsonError("Pay for your package first so you can download your website files.", 402, "PAYMENT_REQUIRED");
  }

  const project = parseProject(raw);
  if (!project.blueprint || !project.assembledPages) {
    return jsonError("Write your website first, then you can download the files.", 409, "NOT_GENERATED");
  }

  const files = await generateProjectFiles({
    businessName: raw.businessName,
    blueprint: project.blueprint,
    site: project.assembledPages,
  });

  const zip = await filesToZip(files);

  // Mark the project as EXPORTED (don't downgrade a live project).
  if (raw.status === ProjectStatus.PAID || raw.status === ProjectStatus.QUOTED || raw.status === ProjectStatus.GENERATED) {
    await prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.EXPORTED },
    });
    await notifyOwnerZipReady({ projectId, businessName: raw.businessName });
  }

  const filename = `${slugify(raw.businessName)}-website.zip`;
  return new Response(new Uint8Array(zip), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(zip.length),
    },
  });
}
