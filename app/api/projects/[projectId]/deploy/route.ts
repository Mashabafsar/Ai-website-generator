import { requireUser, jsonOk, jsonError } from "@/lib/http";
import { getOwnedProject } from "@/lib/projects/projects";
import { hasPaidPackage } from "@/lib/payments/access";
import { deployProject, HostingNotConfiguredError } from "@/lib/deployment/deploy";
import { PackageType } from "@/lib/constants";

type Ctx = { params: Promise<{ projectId: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { projectId } = await params;

  const project = await getOwnedProject(user.id, projectId);
  if (!project) return jsonError("We couldn't find that website project.", 404);
  if (!project.blueprint) return jsonError("Write your website first", 409, "NOT_GENERATED");

  // Payment-gated: live deployment requires a managed-hosting package payment.
  const paid = await hasPaidPackage(projectId, PackageType.MANAGED_HOSTING);
  if (!paid) {
    return jsonError("Pay for hosting first so we can put your site online.", 402, "PAYMENT_REQUIRED");
  }

  try {
    const result = await deployProject(projectId);
    return jsonOk(result);
  } catch (err) {
    console.error("Deploy error:", err);
    if (err instanceof HostingNotConfiguredError || (err instanceof Error && err.name === "HostingNotConfiguredError")) {
      return jsonError(
        "Live hosting isn't connected on this platform yet. Please try again later.",
        503,
        "HOSTING_NOT_CONFIGURED"
      );
    }
    const message = err instanceof Error ? err.message : "We couldn't put your site online.";
    return jsonError(message.slice(0, 240), 500);
  }
}
