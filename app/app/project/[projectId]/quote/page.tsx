import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/session";
import { getOwnedProject } from "@/lib/projects/projects";
import { ProjectStatus, PaymentStatus, PaymentType } from "@/lib/constants";
import { ProjectTabs } from "@/components/app/project-tabs";
import { StatusBadge } from "@/components/app/status-badge";
import { QuotePanel } from "@/components/app/quote-panel";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Quote" };

type QuoteLineItem = { name: string; amount: number };

export default async function QuotePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const { projectId } = await params;

  const project = await getOwnedProject(userId, projectId);
  if (!project) notFound();
  if (project.status === ProjectStatus.DRAFT || !project.blueprint) {
    redirect(`/app/project/${projectId}/questionnaire`);
  }

  const [quoteRow, paidPayment] = await Promise.all([
    prisma.quote.findUnique({ where: { projectId } }),
    prisma.payment.findFirst({
      where: {
        projectId,
        type: PaymentType.WEBSITE_PACKAGE,
        status: PaymentStatus.PAID,
      },
    }),
  ]);

  const initialQuote = quoteRow
    ? {
        packageType: quoteRow.packageType,
        oneTimeTotal: quoteRow.oneTimeTotal,
        monthlyTotal: quoteRow.monthlyTotal,
        currency: quoteRow.currency,
        lineItems: JSON.parse(quoteRow.lineItems) as QuoteLineItem[],
      }
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold tracking-tight">Quote & payment</h1>
          <StatusBadge status={project.status} />
        </div>
      </div>

      <ProjectTabs projectId={projectId} />

      <QuotePanel projectId={projectId} initialQuote={initialQuote} isPaid={Boolean(paidPayment)} />
    </div>
  );
}
