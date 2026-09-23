import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CreditCard,
  FlaskConical,
  Cloud,
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
import {
  canChangeProjectDesign,
  getUserProjectWithRelations,
  nextProjectStep,
} from "@/lib/projects/projects";
import { listPublishedTemplates } from "@/lib/templates/store";
import { StatusBadge } from "@/components/app/status-badge";

export const metadata: Metadata = { title: "Dashboard" };

// Dashboard — follows the app design system: Onest type, ink neutrals, hairline
// borders, blue→purple accent chips, and the cyan→purple sales banner.

const STEPS = [
  {
    icon: LayoutTemplate,
    title: "Design",
    desc: "Pick a finished look. We keep the layout; AI fills in your words and photos.",
  },
  {
    icon: Target,
    title: "Your business",
    desc: "Answer a few questions — or we can read your current website and fill them in.",
  },
  {
    icon: PenLine,
    title: "Your pages",
    desc: "AI writes the words and picks photos. You can change anything by hand.",
  },
  {
    icon: CreditCard,
    title: "Price",
    desc: "See a clear price, then pay to download your files or have us put the site online.",
  },
  {
    icon: Cloud,
    title: "Saved copy",
    desc: "We keep a saved copy of your site as soon as it’s written — even before you pay.",
  },
  {
    icon: Rocket,
    title: "Go live",
    desc: "Download your website files, or we put the site online for you.",
  },
  {
    icon: Wrench,
    title: "Keep it running",
    desc: "If we host it, we keep the site online and up to date.",
  },
];

const AGENTS = [
  {
    icon: ScanSearch,
    title: "Website helper",
    desc: "Tell us your goals, or let us read your current site. We’ll suggest a design and what to change.",
  },
  {
    icon: PenLine,
    title: "Writer",
    desc: "We write clear, friendly words for your website so visitors understand you and know what to do next.",
  },
  {
    icon: ImageIcon,
    title: "Photos",
    desc: "Choose from our photo library, or upload your own pictures.",
  },
  {
    icon: Video,
    title: "Videos",
    desc: "Add video from our library, or use your own clips.",
  },
  {
    icon: Rocket,
    title: "Go live",
    desc: "Put your website online in one click. We handle the technical steps.",
  },
  {
    icon: Users,
    title: "Human help",
    desc: "Talk to our team if you want a person to help finish your site.",
  },
  {
    icon: Search,
    title: "Get found on Google",
    desc: "We write page titles and descriptions so people can find you in search.",
  },
  {
    icon: FlaskConical,
    title: "Compare two versions",
    desc: "Try two layouts and see which one gets more visits or sign-ups.",
  },
  {
    icon: MousePointerClick,
    title: "See where people click",
    desc: "Learn which buttons and sections visitors spend the most time on.",
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
  const start = project ? nextProjectStep(project) : { label: "Get Started", href: "/app/templates" };
  const canPickDesign = !project || canChangeProjectDesign(project.status);

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome banner + pipeline steps */}
      <section className="overflow-clip border border-line shell-gradient-border">
        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5 text-ink">
              <p className="text-2xl font-semibold leading-[1.2]">Hi, {firstName} !</p>
              <p className="text-sm leading-[1.5]">
                It’s easier than ever before to create a new website or revamp an existing website.
                <br />
                Go from design to a live site in these steps.
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

          <div className="grid grid-cols-2 gap-6 bg-[rgba(214,221,255,0.2)] p-6 sm:grid-cols-3 xl:grid-cols-7">
            {STEPS.map((step) => (
              <div key={step.title} className="flex flex-col gap-3">
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
                  href={
                    canPickDesign
                      ? `/app/new-project?templateId=${t.slug}`
                      : start.href
                  }
                  className="shell-accent-chip flex h-8 shrink-0 items-center gap-1 rounded-[240px] px-3 text-[13px] leading-[22.5px] text-ink transition-colors hover:bg-primary-surface"
                >
                  <Wand2 className="size-[17px] text-brand-blue" />
                  {canPickDesign ? "Use this" : "Continue"}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Agents */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold leading-[1.2] text-ink">How we help</h2>
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
  const { label, href } = nextProjectStep(project);
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
            {hasGenerated
              ? "Your site is ready — edit it, see the price, or put it online."
              : "Pick up where you left off to write your website."}
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

