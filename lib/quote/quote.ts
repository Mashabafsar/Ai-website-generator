import { prisma } from "@/lib/prisma";
import { isPackageType, PackageType } from "@/lib/constants";
import { PRICING } from "@/lib/quote/pricing";
import { featuresFromVariants } from "@/lib/quote/features";
import { defaultQuestionnaire, parseQuestionnaireAnswers } from "@/lib/questionnaire/schema";
import type { WebsiteBlueprint } from "@/lib/blueprint/types";

export type QuoteLineItem = { name: string; amount: number };

export type QuoteResult = {
  packageType: PackageType;
  oneTimeTotal: number;
  monthlyTotal: number;
  currency: string;
  lineItems: QuoteLineItem[];
};

/**
 * Deterministic quote calculation. Counts pages, sections, and features from
 * the validated blueprint. No AI, no human estimation, no complexity uplift.
 */
export function computeQuote(input: {
  blueprint: WebsiteBlueprint;
  features: string[];
  packageType: PackageType;
}): QuoteResult {
  const { blueprint, features, packageType } = input;
  const isManaged = packageType === PackageType.MANAGED_HOSTING;

  const lineItems: QuoteLineItem[] = [];

  lineItems.push({
    name: "Website creation",
    amount: PRICING.websiteCreation,
  });

  if (isManaged) {
    lineItems.push({
      name: "Your site's web address",
      amount: PRICING.subdomain,
    });
  }

  const pageCount = blueprint.pages.length;
  const extraPages = Math.max(0, pageCount - PRICING.includedPages);
  if (extraPages > 0) {
    lineItems.push({
      name: `Additional pages (${extraPages} × $${PRICING.perAdditionalPage})`,
      amount: extraPages * PRICING.perAdditionalPage,
    });
  }

  const sectionCount = blueprint.pages.reduce((sum, p) => sum + p.sections.length, 0);
  const extraSections = Math.max(0, sectionCount - PRICING.includedSections);
  if (extraSections > 0) {
    lineItems.push({
      name: `Extra sections (${extraSections} × $${PRICING.perExtraSection})`,
      amount: extraSections * PRICING.perExtraSection,
    });
  }

  for (const feature of features) {
    const amount = PRICING.features[feature] ?? 0;
    if (amount > 0) {
      lineItems.push({
        name: PRICING.featureLabels[feature] ?? feature,
        amount,
      });
    }
  }

  const oneTimeTotal = lineItems.reduce((sum, li) => sum + li.amount, 0);
  const monthlyTotal = isManaged ? PRICING.managedHostingMonthly : 0;

  if (monthlyTotal > 0) {
    lineItems.push({ name: "Monthly hosting", amount: monthlyTotal });
  }

  return {
    packageType,
    oneTimeTotal,
    monthlyTotal,
    currency: PRICING.currency,
    lineItems,
  };
}

/**
 * Compute and persist the quote for a project. Reads the stored blueprint and
 * questionnaire (for features + selected package). Upserts the single Quote row.
 * `packageTypeOverride` is the hosting choice from the pre-payment dialog.
 */
export async function generateAndSaveQuote(
  projectId: string,
  packageTypeOverride?: PackageType
): Promise<QuoteResult> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { questionnaire: true },
  });
  if (!project?.blueprint) throw new Error("Project not generated");

  const blueprint = JSON.parse(project.blueprint) as WebsiteBlueprint;
  const answers = project.questionnaire?.answers
    ? parseQuestionnaireAnswers(project.questionnaire.answers)
    : defaultQuestionnaire;

  // Features come from the template's locked section list, materialized in the
  // blueprint — never from user checkboxes.
  const features = featuresFromVariants(
    blueprint.pages.flatMap((page) => page.sections.map((section) => section.variant))
  );
  const packageType =
    packageTypeOverride ??
    (isPackageType(answers.packageType) ? answers.packageType : PackageType.SELF_HOSTING);

  if (packageTypeOverride && project.questionnaire) {
    await prisma.questionnaire.update({
      where: { projectId },
      data: { answers: JSON.stringify({ ...answers, packageType: packageTypeOverride }) },
    });
  }

  const quote = computeQuote({ blueprint, features, packageType });

  await prisma.quote.upsert({
    where: { projectId },
    create: {
      projectId,
      packageType: quote.packageType,
      oneTimeTotal: quote.oneTimeTotal,
      monthlyTotal: quote.monthlyTotal,
      currency: quote.currency,
      lineItems: JSON.stringify(quote.lineItems),
    },
    update: {
      packageType: quote.packageType,
      oneTimeTotal: quote.oneTimeTotal,
      monthlyTotal: quote.monthlyTotal,
      currency: quote.currency,
      lineItems: JSON.stringify(quote.lineItems),
    },
  });

  return quote;
}
