import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  FileQuestion,
  LayoutTemplate,
  Github,
  Rocket,
  Wand2,
  ImageIcon,
  Coins,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { HeroSection } from "@/components/marketing/hero-section";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/session";

export default async function LandingPage() {
  const userId = await getCurrentUserId();
  if (userId) redirect("/app/templates");

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <HeroSection />
      <HowItWorks />
      <SectionsShowcase />
      <Pricing />
      <FinalCta />
      <SiteFooter />
    </div>
  );
}

const steps = [
  {
    icon: FileQuestion,
    title: "Answer the questionnaire",
    body: "Tell us your business, audience, services, and style. Structured questions, not a blank prompt.",
  },
  {
    icon: Wand2,
    title: "AI drafts a blueprint",
    body: "A heavy model plans pages, sections, SEO, and copy — returned as validated structured data.",
  },
  {
    icon: LayoutTemplate,
    title: "Assembled from real sections",
    body: "The blueprint maps to a curated ShadCN component library, so the output is clean and consistent.",
  },
  {
    icon: Github,
    title: "Saved to GitHub, ready to ship",
    body: "Your code is versioned automatically. Export a ZIP or deploy to a live subdomain when you're ready.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">How it works</span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground">
            From questionnaire to code in four steps
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="group relative rounded-none border border-line bg-card p-6 transition-colors hover:border-primary-border"
            >
              <div className="shell-accent-chip flex h-11 w-11 items-center justify-center rounded text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <div className="mt-5 text-xs font-semibold text-muted-foreground">
                STEP {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-1 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const capabilities = [
  { icon: LayoutTemplate, label: "Hero, Services, About" },
  { icon: Sparkles, label: "Testimonials & FAQ" },
  { icon: ImageIcon, label: "Auto stock imagery" },
  { icon: Wand2, label: "AI section rewrites" },
];

function SectionsShowcase() {
  return (
    <section id="sections" className="relative overflow-hidden bg-neutral-5 py-24">
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">The system</span>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink">
              AI plans it. A curated library builds it.
            </h2>
            <p className="mt-5 text-lg text-ink-muted">
              We never let the model write raw frontend code. It returns a structured
              blueprint, and we render it with reusable, production-grade sections — so
              every site is consistent, accessible, and easy to edit.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {capabilities.map((c) => (
                <div key={c.label} className="flex items-center gap-3 rounded-none border border-line bg-white p-4 text-ink">
                  <c.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-none border border-line bg-white shell-card-shadow">
              <div className="flex items-center gap-2 border-b border-line px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-error-main/60" />
                <span className="h-3 w-3 rounded-full bg-secondary-main/70" />
                <span className="h-3 w-3 rounded-full bg-success-main/60" />
              </div>
              <div className="space-y-4 p-6">
                <div className="h-40 rounded-none bg-primary" />
                <div className="h-4 w-2/3 rounded bg-neutral-5" />
                <div className="h-4 w-1/2 rounded bg-neutral-5" />
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="h-20 rounded-none bg-primary-surface" />
                  <div className="h-20 rounded-none bg-primary-surface" />
                  <div className="h-20 rounded-none bg-primary-surface" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">Pricing</span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground">
            Generate with credits. Pay only to ship.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start with free credits on signup. Generation and AI edits spend credits.
            You only pay a package fee when you download the code or go live.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="rounded-none border border-line bg-card p-8">
            <Coins className="h-8 w-8 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">Self-hosting</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              One-time fee. Download a complete Next.js codebase and host it anywhere.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>• Full source code ZIP</li>
              <li>• Saved to your GitHub</li>
              <li>• Deployment guide included</li>
            </ul>
          </div>
          <div className="relative rounded-none border-2 border-primary-border bg-card p-8">
            <span className="absolute right-6 top-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Managed
            </span>
            <Rocket className="h-8 w-8 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">Managed hosting</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Creation fee plus monthly hosting. We deploy to a live subdomain for you.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>• Automatic deployment</li>
              <li>• Live subdomain</li>
              <li>• Managed updates</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section
      className="relative overflow-hidden py-24"
      style={{ backgroundImage: "linear-gradient(-78deg, #24d5f6 39.5%, #5a12f0 99.7%)" }}
    >
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Build your website today
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">
          Sign up, answer a few questions, and watch Agency Partner Interactive's AI
          assemble your site — free credits included.
        </p>
        <div className="mt-9">
          <Button asChild size="lg" className="group bg-white text-ink hover:bg-neutral-5">
            <Link href="/signup">
              Start building free
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
