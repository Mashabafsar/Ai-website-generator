import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsPageClient } from "@/components/settings/settings-page";
import type { BusinessDetailsSeed, SettingsTab } from "@/components/settings/types";
import { getCurrentSession } from "@/lib/auth/session";
import { getBalance } from "@/lib/credits/credits";
import { env } from "@/lib/env";
import { PackageType, PaymentStatus } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getUserProjectWithRelations, nextProjectStep } from "@/lib/projects/projects";
import { parseQuestionnaireAnswers, type QuestionnaireAnswers } from "@/lib/questionnaire/schema";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");

  const { tab } = await searchParams;
  const initialTab: SettingsTab =
    tab === "billing" || tab === "business" || tab === "account" ? tab : "account";

  const userId = session.user.id;
  const [project, account, creditBalance] = await Promise.all([
    getUserProjectWithRelations(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    }),
    getBalance(userId),
  ]);

  const canUpdatePaymentMethod =
    Boolean(account?.stripeCustomerId) || hasPaidManagedHosting(project?.payments ?? []);

  return (
    <SettingsPageClient
      initialTab={initialTab}
      user={{
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      }}
      canUpdatePaymentMethod={canUpdatePaymentMethod}
      generateCost={env.credits.costHeavyGenerate}
      creditBalance={creditBalance}
      business={businessSeed(project)}
    />
  );
}

function hasPaidManagedHosting(
  payments: { status: string; packageType: string | null; stripeSubscriptionId: string | null }[]
): boolean {
  return payments.some(
    (payment) =>
      payment.status === PaymentStatus.PAID &&
      (payment.packageType === PackageType.MANAGED_HOSTING || Boolean(payment.stripeSubscriptionId))
  );
}

function businessSeed(
  project: Awaited<ReturnType<typeof getUserProjectWithRelations>>
): BusinessDetailsSeed {
  if (!project) return { state: "empty" };

  const next = nextProjectStep({
    id: project.id,
    status: project.status,
    templateId: project.templateId,
    questionnaire: project.questionnaire,
  });

  if (!project.questionnaire || !project.templateId) {
    return { state: "continue", href: next.href, label: next.label };
  }

  const answers = readStoredAnswers(project.questionnaire.answers, project.templateId);
  if (!answers) {
    return { state: "continue", href: next.href, label: next.label };
  }

  return {
    state: "ready",
    projectId: project.id,
    answers,
    canRegenerate: Boolean(project.blueprint),
    questionnaireHref: `/app/project/${project.id}/questionnaire`,
    previewHref: `/app/project/${project.id}/preview`,
  };
}

function readStoredAnswers(raw: string, templateId: string): QuestionnaireAnswers | null {
  try {
    const source = JSON.parse(raw) as Record<string, unknown>;
    const storedTemplateId = typeof source.templateId === "string" ? source.templateId : "";
    return parseQuestionnaireAnswers({
      ...source,
      templateId: templateId || storedTemplateId,
    });
  } catch (err) {
    console.error(
      "[settings] could not read questionnaire:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
