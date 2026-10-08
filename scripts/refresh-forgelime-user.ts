/**
 * Reassemble the most recently updated Forge Lime project (or a given email)
 * so preview picks up template code + the user's theme colors.
 *
 *   node --env-file-if-exists=.env --import tsx scripts/refresh-forgelime-user.ts
 *   node --env-file-if-exists=.env --import tsx scripts/refresh-forgelime-user.ts gibaru@mailinator.com
 */

import { prisma } from "@/lib/prisma";
import { assembleSite } from "@/lib/agents/section-assembly";
import { parseQuestionnaireAnswers } from "@/lib/questionnaire/schema";
import { CUSTOM_PALETTE_NAME, createTheme, isDeliberateTheme } from "@/lib/agents/theme";
import type { ThemeTokens, WebsiteBlueprint } from "@/lib/blueprint/types";

async function main() {
  const emailArg = process.argv[2]?.trim().toLowerCase();

  const forgeTemplate = await prisma.template.findFirst({
    where: { OR: [{ slug: "forgelime" }, { renderer: "forgelime" }] },
    select: { id: true, slug: true },
  });
  if (!forgeTemplate) {
    console.error("No forgelime template in DB.");
    process.exit(1);
  }

  const project = await prisma.project.findFirst({
    where: {
      templateId: forgeTemplate.id,
      user: {
        deactivatedAt: null,
        ...(emailArg ? { email: { equals: emailArg, mode: "insensitive" } } : {}),
      },
      blueprint: { not: null },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { id: true, email: true } },
      questionnaire: { select: { answers: true } },
    },
  });

  if (!project?.blueprint) {
    console.error(emailArg ? `No Forge Lime project for ${emailArg}` : "No Forge Lime project found.");
    process.exit(1);
  }

  const blueprint = JSON.parse(project.blueprint) as WebsiteBlueprint;

  let answers: ReturnType<typeof parseQuestionnaireAnswers> | null = null;
  if (project.questionnaire?.answers) {
    try {
      answers = parseQuestionnaireAnswers(project.questionnaire.answers);
    } catch {
      answers = null;
    }
  }

  let theme: ThemeTokens;
  if (project.theme) {
    theme = JSON.parse(project.theme) as ThemeTokens;
  } else {
    const colorPreference = answers?.colorPreference?.trim() || "Neon lime";
    theme = createTheme(colorPreference, answers?.visualStyle || "Modern", {
      colorPreferenceExplicit: Boolean(answers?.colorPreference?.trim()),
      tone: answers?.tone || undefined,
      choice: blueprint.design
        ? { palette: blueprint.design.palette, fontFamily: blueprint.design.fontFamily }
        : undefined,
    });
  }

  // brandStyle only writes full theme CSS vars when palette is deliberate.
  if (!isDeliberateTheme(theme) && theme.colors?.primary) {
    theme = {
      ...theme,
      palette: theme.palette?.trim() || CUSTOM_PALETTE_NAME,
    };
  }

  const contact = {
    email: answers?.contactEmail?.trim() || undefined,
    phone: answers?.contactPhone?.trim() || undefined,
  };

  const site = {
    ...assembleSite(blueprint, theme),
    contact,
    renderer: "forgelime" as const,
    templateSlug: "forgelime",
  };

  await prisma.project.update({
    where: { id: project.id },
    data: {
      assembledPages: JSON.stringify(site),
      theme: JSON.stringify(site.theme),
      businessName: blueprint.business.name || project.businessName,
    },
  });

  console.log(
    JSON.stringify(
      {
        email: project.user.email,
        projectId: project.id,
        business: site.businessName,
        status: project.status,
        palette: site.theme.palette,
        deliberate: isDeliberateTheme(site.theme),
        primary: site.theme.colors?.primary,
        secondary: site.theme.colors?.secondary,
        accent: site.theme.colors?.accent,
        contactEmail: contact.email ?? null,
      },
      null,
      2
    )
  );
  console.log("Reassembled. Refresh the preview to see theme colors + working form.");
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
