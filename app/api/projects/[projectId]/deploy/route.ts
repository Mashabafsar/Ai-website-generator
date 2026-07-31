import { requireUser, jsonOk, jsonError } from "@/lib/http";
import { getOwnedProject } from "@/lib/projects/projects";
import { hasPaidPackage } from "@/lib/payments/access";
import { deployProject } from "@/lib/deployment/deploy";
import { PackageType } from "@/lib/constants";

export const maxDuration = 120;

type Ctx = { params: Promise<{ projectId: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { projectId } = await params;

  const project = await getOwnedProject(user.id, projectId);
  if (!project) return jsonError("Project not found", 404);
  if (!project.blueprint) return jsonError("Generate your website first", 409, "NOT_GENERATED");

  // Payment-gated: live deployment requires a managed-hosting package payment.
  const paid = await hasPaidPackage(projectId, PackageType.MANAGED_HOSTING);
  if (!paid) {
    return jsonError("Managed hosting payment required to deploy.", 402, "PAYMENT_REQUIRED");
  }

  try {
    const result = await deployProject(projectId);
    return jsonOk(result);
  } catch (err) {
    console.error("Deploy error:", err);
    return jsonError("Deployment failed. See deployment logs.", 500);
  }
}
