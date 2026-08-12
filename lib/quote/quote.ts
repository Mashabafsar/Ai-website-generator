import { prisma } from "@/lib/prisma";
import { PackageType } from "@/lib/constants";
import { PRICING, PACKAGE_LABELS } from "@/lib/quote/pricing";
import { featuresFromVariants } from "@/lib/quote/features";
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
 * Deterministic quote calculation. Counts pages, sections, complexity, and
 * features from the validated blueprint. No AI, no human estimation.
 */
export function computeQuote(input: {
  blueprint: WebsiteBlueprint;
  features: string[];
  packageType: PackageType;
}): QuoteResult {
  const { blueprint, features, packageType } = input;
  const base = PRICING.basePackage[packageType] ?? PRICING.basePackage[PackageType.SELF_HOSTING];

  const lineItems: QuoteLineItem[] = [];

  // 1. Base creation fee.
  lineItems.push({
    name: `Website creation — ${PACKAGE_LABELS[packageType] ?? packageType}`,
    amount: base.oneTime,
  });

  // 2. Additional pages.
  const pageCount = blueprint.pages.length;
  const extraPages = Math.max(0, pageCount - PRICING.includedPages);
  if (extraPages > 0) {
    lineItems.push({
      name: `Additional pages (${extraPages} × $${PRICING.perAdditionalPage})`,
      amount: extraPages * PRICING.perAdditionalPage,
    });
  }

  // 3. Extra sections beyond the included baseline.
  const sectionCount = blueprint.pages.reduce((sum, p) => sum + p.sections.length, 0);
  const extraSections = Math.max(0, sectionCount - PRICING.includedSections);
  if (extraSections > 0) {
    lineItems.push({
      name: `Extra sections (${extraSections} × $${PRICING.perExtraSection})`,
      amount: extraSections * PRICING.perExtraSection,
    });
  }

  // 4. Complexity uplift.
  const level = blueprint.complexity?.level ?? "medium";
  const complexityAmount = PRICING.complexity[level] ?? 0;
  if (complexityAmount > 0) {
    lineItems.push({ name: `Complexity — ${level}`, amount: complexityAmount });
  }

  // 5. Feature add-ons.
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
  const monthlyTotal = base.monthly;

  if (monthlyTotal > 0) {
    lineItems.push({ name: "Managed hosting (monthly)", amount: monthlyTotal });
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
 */
export async function generateAndSaveQuote(projectId: string): Promise<QuoteResult> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { questionnaire: true },
  });
  if (!project?.blueprint) throw new Error("Project not generated");

  const blueprint = JSON.parse(project.blueprint) as WebsiteBlueprint;
  const answers = project.questionnaire?.answers
    ? (JSON.parse(project.questionnaire.answers) as { packageType?: PackageType })
    : {};

  // Features come from the template's locked section list, materialized in the
  // blueprint — never from user checkboxes.
  const features = featuresFromVariants(
    blueprint.pages.flatMap((page) => page.sections.map((section) => section.variant))
  );
  const packageType = answers.packageType ?? PackageType.SELF_HOSTING;

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
