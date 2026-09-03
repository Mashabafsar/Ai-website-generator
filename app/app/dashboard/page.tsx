import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  FlaskConical,
  Image as ImageIcon,
  LayoutTemplate,
  MousePointerClick,
  PenLine,
  Rocket,
  ScanSearch,
  Search,
  Target,
  Users,
  Video,
  Wand2,
  Wrench,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { getUserProjectWithRelations } from "@/lib/projects/projects";
import { listPublishedTemplates } from "@/lib/templates/store";
import { StatusBadge } from "@/components/app/status-badge";
import { ProjectStatus } from "@/lib/constants";

export const metadata: Metadata = { title: "Dashboard" };

// Dashboard — follows the app design system: Onest type, ink neutrals, hairline
// borders, blue→purple accent chips, and the cyan→purple sales banner.

const STEPS = [
  {
    icon: Target,
    title: "Define",
    desc: "Define your objectives & business goals or analyze your current site using our agent.",
  },
  {
    icon: LayoutTemplate,
    title: "Template",
    desc: "Select an existing template that matches your industry and design preference.",
  },
  {
    icon: PenLine,
    title: "Content",
    desc: "Bring your own content, images & videos or generate it using AI Tokens.",
  },
  {
    icon: Wrench,
    title: "Tech Stack & Maintenance",
    desc: "Select the right tech stack for your site and maintenance plan with experts.",
  },
  {
    icon: Rocket,
    title: "Deploy",
    desc: "Host the website on Vercel or on our AWS Cloud server with 99.9% uptime.",
  },
];

const AGENTS = [
  {
    icon: ScanSearch,
    title: "Website Analyst",
    desc: "Define your objectives & business goals or analyze your current site using our agent. The analyst will recommend you template and suggest changes.",
  },
  {
    icon: PenLine,
    title: "Copywriter",
    desc: "Craft a storytelling copy for your website. That engages users and create conversions for your business.",
  },
  {
    icon: ImageIcon,
    title: "Images",
    desc: "Explore our world class library of free and paid images or Generate AI Images using nano banana.",
  },
  {
    icon: Video,
    title: "Videos",
    desc: "Explore our world class library of free and paid video or Generate AI Videos using omni Flash.",
  },
  {
    icon: Rocket,
    title: "Deployment",
    desc: "Deploy your website using Agentic Infrastructure in one click. Ship websites that scale from zero to millions instantly",
  },
  {
    icon: Users,
    title: "Customer Success",
    desc: "Get help finishing your website with our customer support. Talk to Designer, Developer, Digital Marketers, QA, DevOps Specialist",
  },
  {
    icon: Search,
    title: "Search Engine Optimization",
    desc: "Write SEO friendly blogs to rank higher on Google, Bing. Attract more audience to the website",
  },
  {
    icon: FlaskConical,
    title: "A/B Testing",
    desc: "Conduct A/B Testing on two different layout. Understand user behaviors, conversions.",
  },
  {
    icon: MousePointerClick,
    title: "Heatmaps",
    desc: "Get the heat-maps data to help understand on which section or button user spent most of the time.",
  },
];

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");

  const [project, templates] = await Promise.all([
    getUserProjectWithRelations(session.user.id),
    listPublishedTemplates(),
  ]);

  const firstName = session.user.name.split(" ")[0];
  const start = project ? nextStep(project) : { label: "Get Started", href: "/app/templates" };

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome banner + 5 steps */}
      <section className="overflow-clip border border-line shell-gradient-border">
        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5 text-ink">
              <p className="text-2xl font-semibold leading-[1.2]">Hi, {firstName} !</p>
              <p className="text-sm leading-[1.5]">
                It’s easier than ever before to create a new website or revamp an existing website.
                <br />
                Go from existing website to a new website in 5 easy steps.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href={start.href}
                className="flex h-10 items-center justify-center border-[0.75px] border-line bg-white px-[18px] text-[15px] leading-[22.5px] text-ink transition-colors hover:bg-secondary"
              >
                {start.label}
              </Link>
              <Link
                href="/app/credits"
                className="flex h-10 items-center justify-center bg-brand-purple px-[18px] text-[15px] leading-[22.5px] text-white transition-colors hover:bg-info-hover"
              >
                Explore Plans
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 bg-[rgba(214,221,255,0.2)] p-6">
            {STEPS.map((step) => (
              <div key={step.title} className="flex min-w-[180px] flex-1 flex-col gap-3">
                <span className="shell-accent-chip grid size-[37px] place-items-center rounded">
                  <step.icon className="size-5 text-brand-blue" />
                </span>
                <div>
                  <p className="text-base font-semibold leading-[1.5] text-ink">{step.title}</p>
                  <p className="text-sm leading-[1.5] text-ink-soft">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {project && <ProjectPanel project={project} />}

      {/* Templates */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold leading-[1.2] text-ink">Templates</h2>
          <Link href="/app/templates" className="text-lg font-medium text-brand-blue hover:underline">
            View All&nbsp;&nbsp;→
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-[30px] md:grid-cols-3 xl:grid-cols-5">
          {templates.slice(0, 5).map((t) => (
            <article
              key={t.id}
              className="flex flex-col overflow-clip border border-line bg-white"
            >
              <div className="relative h-[222px] overflow-hidden bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.previewImageUrl || t.thumbnailUrl}
                  alt={t.name}
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex min-w-0 flex-col gap-0.5 leading-[1.5]">
                  <p className="truncate text-sm font-medium text-ink">{t.name}</p>
                  <p className="truncate text-xs text-ink-muted">{t.bestFor}</p>
                </div>
                <Link
                  href={`/app/new-project?templateId=${t.slug}`}
                  className="shell-accent-chip flex h-8 shrink-0 items-center gap-1 rounded-[240px] px-3 text-[13px] leading-[22.5px] text-ink transition-colors hover:bg-primary-surface"
                >
                  <Wand2 className="size-[17px] text-brand-blue" />
                  Remix
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Agents */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold leading-[1.2] text-ink">Agents</h2>
          <Link href="/app/dashboard#agents" className="text-lg font-medium text-brand-blue hover:underline">
            View All&nbsp;&nbsp;→
          </Link>
        </div>
        <div id="agents" className="grid gap-[30px] md:grid-cols-2 xl:grid-cols-3">
          {AGENTS.map((agent) => (
            <article
              key={agent.title}
              className="flex items-start gap-4 overflow-clip border border-line bg-white p-4"
            >
              <span className="shell-accent-chip grid h-11 w-[45px] shrink-0 place-items-center rounded">
                <agent.icon className="size-6 text-brand-blue" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-lg font-medium leading-[1.2] text-black">{agent.title}</p>
                <p className="text-xs leading-[1.5] text-ink-soft">{agent.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Contact sales */}
      <section
        className="relative overflow-clip"
        style={{ backgroundImage: "linear-gradient(-78deg, #24d5f6 39.5%, #5a12f0 99.7%)" }}
      >
        <div className="flex flex-col gap-6 p-8 lg:p-10">
          <div className="flex max-w-3xl flex-col gap-1 text-white">
            <p className="text-[32px] font-semibold leading-[1.2]">Partner with us.</p>
            <p className="text-sm leading-[1.5]">
              For Business &amp; Enterprise Sites, Contact our Sales Team.
              <br />
              <br />
              We’ve delivered websites and web applications to fortune 500 using our Digital Growth
              Engine. Our partners has grown there revenue from 0 → $Millions using our design,
              development, digital marketing and AI Services.
            </p>
          </div>
          <div>
            <a
              href="mailto:sales@agencypartner.com"
              className="inline-flex h-10 items-center justify-center border-[0.75px] border-line-strong bg-white px-[18px] text-[15px] leading-[22.5px] text-ink transition-colors hover:bg-secondary"
            >
              Schedule a Call
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProjectPanel({
  project,
}: {
  project: NonNullable<Awaited<ReturnType<typeof getUserProjectWithRelations>>>;
}) {
  const { label, href } = nextStep(project);
  const hasGenerated = ["GENERATED", "QUOTED", "PAID", "EXPORTED", "DEPLOYING", "LIVE"].includes(
    project.status
  );

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold leading-[1.2] text-ink">Your Project</h2>
      </div>
      <article className="flex flex-wrap items-center justify-between gap-4 border border-line bg-white p-6">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-3">
            <p className="truncate text-lg font-medium leading-[1.2] text-black">
              {project.businessName}
            </p>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-sm leading-[1.5] text-ink-muted">
            /{project.slug} ·{" "}
            {hasGenerated
              ? "Generated — continue editing, get a quote, or ship it."
              : "Continue where you left off to generate your website."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={href}
            className="flex h-10 items-center gap-2 bg-primary px-[18px] text-[15px] leading-[22.5px] text-primary-foreground transition-colors hover:bg-primary-hover active:bg-primary-pressed"
          >
            {label}
            <ArrowRight className="size-4" />
          </Link>
          {hasGenerated && (
            <>
              <Link
                href={`/app/project/${project.id}/editor`}
                className="flex h-10 items-center border-[0.75px] border-line bg-white px-[18px] text-[15px] leading-[22.5px] text-ink transition-colors hover:bg-secondary"
              >
                Editor
              </Link>
              <Link
                href={`/app/project/${project.id}/quote`}
                className="flex h-10 items-center border-[0.75px] border-line bg-white px-[18px] text-[15px] leading-[22.5px] text-ink transition-colors hover:bg-secondary"
              >
                Get a quote
              </Link>
            </>
          )}
        </div>
      </article>
    </section>
  );
}

function nextStep(project: {
  id: string;
  status: string;
  templateId: string | null;
  questionnaire: unknown;
}): { label: string; href: string } {
  const base = `/app/project/${project.id}`;
  switch (project.status) {
    case ProjectStatus.DRAFT:
      if (!project.templateId) return { label: "Choose a design", href: "/app/templates" };
      return project.questionnaire
        ? { label: "Generate website", href: `${base}/questionnaire` }
        : { label: "Continue questionnaire", href: `${base}/questionnaire` };
    case ProjectStatus.GENERATING:
      return { label: "View progress", href: `${base}/preview` };
    default:
      return { label: "Open preview", href: `${base}/preview` };
  }
}
