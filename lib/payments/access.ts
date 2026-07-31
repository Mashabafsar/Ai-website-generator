import { prisma } from "@/lib/prisma";
import { PaymentStatus, PaymentType, PackageType } from "@/lib/constants";

/**
 * Whether the user has a completed website-package payment for this project.
 * Optionally scope to a specific package type (self-hosting vs managed).
 */
export async function hasPaidPackage(
  projectId: string,
  packageType?: PackageType
): Promise<boolean> {
  const payment = await prisma.payment.findFirst({
    where: {
      projectId,
      type: PaymentType.WEBSITE_PACKAGE,
      status: PaymentStatus.PAID,
      ...(packageType ? { packageType } : {}),
    },
  });
  return Boolean(payment);
}
