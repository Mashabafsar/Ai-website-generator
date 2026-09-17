import { z } from "zod";
import { env } from "@/lib/env";
import { extractJson } from "@/lib/blueprint/schema";
import { pageTitle } from "@/lib/blueprint/page-catalog";
import { runCursorText } from "@/lib/ai/cursor-runtime";
import { getVariantSpec } from "@/lib/sections/registry";
import type { QuestionnaireAnswers } from "@/lib/questionnaire/schema";
import type { TemplatePageDef } from "@/lib/templates/types";
import {
  clampSiteLayout,
  isMultiPageTemplate,
  sectionTypeLabel,
  suggestedSiteLayout,
  type SiteLayoutPage,
} from "@/lib/agents/site-layout";
import { signalsFromAnswers, type ContentSignals } from "@/lib/agents/site-structure";

export type SitePlanPageView = {
  slug: string;
  title: string;
  why: string;
  sections: string[];
};

export type SitePlanView = {
  audience: string;
  summary: string;
  pages: SitePlanPageView[];
  fingerprint: string;
};

export type SitePlan = {
  layout: SiteLayoutPage[];
  view: SitePlanView;
  fromAi: boolean;
};

type PlanAnswers = Pick<
  QuestionnaireAnswers,
  | "businessName"
  | "industry"
  | "description"
  | "location"
  | "targetAudience"
  | "demographics"
  | "goals"
  | "services"
  | "brandingNotes"
>;

const aiPlanSchema = z.object({
  audience: z.string().max(400).optional(),
  summary: z.string().max(800).optional(),
  pages: z
    .array(
      z.object({
        slug: z.string().min(1).max(40),
        why: z.string().max(280).optional(),
        sections: z.array(z.string().min(1).max(80)).max(40),
      })
    )
    .min(1)
    .max(12),
});

export function planFingerprint(answers: PlanAnswers, templatePages: TemplatePageDef[]): string {
  return JSON.stringify({
    pages: templatePages.map((p) => p.slug),
    businessName: answers.businessName.trim(),
    industry: answers.industry.trim(),
    description: answers.description.trim(),
    location: answers.location?.trim() || "",
    audience: answers.targetAudience.trim(),
    demographics: answers.demographics.trim(),
    goals: answers.goals.trim(),
    services: answers.services.map((s) => s.trim()).filter(Boolean),
  });
}

/**
 * Website Planner Agent — reads the customer's answers in everyday terms and
 * picks which pages and sections this design should actually use. The customer
 * does not have to know what a "section" is. Falls back to rules when the
 * model is slow or unavailable.
 */
export async function planWebsiteLayout(
  answers: PlanAnswers,
  templatePages: TemplatePageDef[]
): Promise<SitePlan> {
  const fingerprint = planFingerprint(answers, templatePages);
  const fallback = heuristicPlan(answers, templatePages, fingerprint);

  try {
    const raw = await runPlannerPrompt(buildPlannerPrompt(answers, templatePages));
    const parsed = aiPlanSchema.safeParse(extractJson(raw) ?? {});
    if (!parsed.success) return fallback;

    const layout = clampSiteLayout(
      templatePages,
      parsed.data.pages.map((page) => ({ slug: page.slug, sections: page.sections }))
    );
    if (!layout.length) return fallback;

    const whyBySlug = new Map(
      parsed.data.pages.map((page) => [page.slug, (page.why || "").trim()])
    );
    return {
      layout,
      fromAi: true,
      view: viewFromLayout(layout, templatePages, fingerprint, {
        audience: parsed.data.audience?.trim() || fallback.view.audience,
        summary: parsed.data.summary?.trim() || fallback.view.summary,
        whyBySlug,
      }),
    };
  } catch (err) {
    console.error("[planner] AI plan failed; using rules:", err);
    return fallback;
  }
}

function heuristicPlan(
  answers: PlanAnswers,
  templatePages: TemplatePageDef[],
  fingerprint: string
): SitePlan {
  const signals = signalsFromAnswers({
    industry: answers.industry,
    description: answers.description,
    targetAudience: answers.targetAudience,
    demographics: answers.demographics,
    goals: answers.goals,
    brandingNotes: answers.brandingNotes,
    services: answers.services,
  });
  const layout = suggestedSiteLayout(templatePages, signals);
  return {
    layout,
    fromAi: false,
    view: viewFromLayout(layout, templatePages, fingerprint, {
      audience: defaultAudienceLine(answers),
      summary: defaultSummary(answers, layout, templatePages),
      whyBySlug: defaultWhys(layout, signals),
    }),
  };
}

function viewFromLayout(
  layout: SiteLayoutPage[],
  templatePages: TemplatePageDef[],
  fingerprint: string,
  extras: {
    audience: string;
    summary: string;
    whyBySlug: Map<string, string>;
  }
): SitePlanView {
  const titles = new Map(templatePages.map((p) => [p.slug, p.title || pageTitle(p.slug)]));
  return {
    audience: extras.audience.slice(0, 400),
    summary: extras.summary.slice(0, 800),
    fingerprint,
    pages: layout.map((page) => ({
      slug: page.slug,
      title: titles.get(page.slug) || pageTitle(page.slug),
      why: (extras.whyBySlug.get(page.slug) || defaultPageWhy(page.slug)).slice(0, 280),
      sections: uniqueLabels(page.sections),
    })),
  };
}

function uniqueLabels(variants: string[]): string[] {
  const labels: string[] = [];
  const seen = new Set<string>();
  for (const variant of variants) {
    const spec = getVariantSpec(variant);
    const label = spec ? sectionTypeLabel(spec.type) : variant;
    if (seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
  }
  return labels;
}

function defaultAudienceLine(answers: PlanAnswers): string {
  const who = answers.targetAudience.trim() || answers.demographics.trim();
  const where = answers.location?.trim();
  if (who && where) return `${who} in ${where}.`;
  if (who) return `${who}.`;
  return `People looking for ${answers.industry.trim() || "this business"}.`;
}

function defaultSummary(
  answers: PlanAnswers,
  layout: SiteLayoutPage[],
  templatePages: TemplatePageDef[]
): string {
  const name = answers.businessName.trim() || "this business";
  const multi = isMultiPageTemplate(templatePages);
  const n = layout.length;
  if (multi) {
    return `We'll build a ${n}-page site for ${name} that matches who you serve — no need to pick pages yourself.`;
  }
  return `We'll put the right sections on one page for ${name}, based on who you serve.`;
}

function defaultPageWhy(slug: string): string {
  switch (slug) {
    case "home":
      return "The first impression — who you are and how to get in touch.";
    case "about":
      return "Your story, so new visitors feel they can trust you.";
    case "services":
      return "A clear list of what you offer.";
    case "pricing":
      return "How people can work with you, with a path to contact you for details.";
    case "contact":
      return "A simple way for visitors to reach you.";
    case "faq":
      return "Answers to the questions people ask before they get in touch.";
    case "portfolio":
      return "Past work, so visitors can see what you do.";
    case "blog":
      return "A place for updates and helpful articles.";
    default:
      return `Included because it helps this audience.`;
  }
}

function defaultWhys(layout: SiteLayoutPage[], signals: ContentSignals): Map<string, string> {
  const map = new Map<string, string>();
  for (const page of layout) {
    if (page.slug === "services" && signals.services.length) {
      map.set(
        page.slug,
        `Shows ${signals.services.slice(0, 3).join(", ")}${signals.services.length > 3 ? ", and more" : ""}.`
      );
    } else {
      map.set(page.slug, defaultPageWhy(page.slug));
    }
  }
  return map;
}

function buildPlannerPrompt(answers: PlanAnswers, templatePages: TemplatePageDef[]): string {
  const multi = isMultiPageTemplate(templatePages);
  const catalog = templatePages
    .map((page) => {
      const slots = page.sections
        .map((variant) => {
          const spec = getVariantSpec(variant);
          if (!spec) return null;
          return `    - variant "${variant}" (${sectionTypeLabel(spec.type)})`;
        })
        .filter(Boolean)
        .join("\n");
      return `PAGE "${page.slug}" — ${page.title || pageTitle(page.slug)}\n${slots}`;
    })
    .join("\n\n");

  return [
    "You are planning a small business website for a non-technical owner.",
    "They should not have to choose pages or sections. You decide, based on",
    "who they serve and what the site should do.",
    "",
    "Return ONLY valid JSON — no markdown, no commentary.",
    '{ "audience": string (1-2 sentences, everyday language),',
    '  "summary": string (1-2 sentences explaining the plan),',
    '  "pages": [ { "slug": string, "why": string (one short sentence), "sections": string[] } ] }',
    "",
    "Rules:",
    "- Use only the page slugs and section variant ids listed below.",
    '- Always include the "home" page.',
    "- Keep hero and footer variants on any page that has them.",
    "- Prefer a smaller, clearer site over including everything.",
    "- Do not include a blog unless they clearly publish articles or news.",
    "- Do not include a portfolio unless they have visual work, projects, or a gallery to show.",
    "- Include contact (or a contact section) so visitors can reach them.",
    "- A pricing page/section is only for packages, memberships, or product tiers — not a typical local service list.",
    multi
      ? "- This design is multi-page. Pick only the pages this audience needs."
      : "- This design is a single page. Return only slug \"home\" and pick the sections that page needs.",
    "",
    "Business:",
    JSON.stringify({
      name: answers.businessName,
      industry: answers.industry,
      description: answers.description,
      location: answers.location,
      audience: answers.targetAudience,
      demographics: answers.demographics,
      goals: answers.goals,
      services: answers.services,
    }),
    "",
    "AVAILABLE PAGES AND SECTIONS:",
    catalog,
  ].join("\n");
}

async function runPlannerPrompt(prompt: string): Promise<string> {
  if (!env.ai.cursorApiKey) {
    throw new Error("CURSOR_API_KEY is not configured");
  }
  return runCursorText(
    env.ai.cursorApiKey,
    env.ai.lightModel,
    prompt,
    env.ai.cursorLightTimeoutMs
  );
}
