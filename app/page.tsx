import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  FileQuestion,
  LayoutTemplate,
  Globe,
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
    icon: LayoutTemplate,
    title: "Pick a design",
    body: "Choose a finished look. We keep the layout; AI fills in your words and photos.",
  },
  {
    icon: FileQuestion,
    title: "Tell us about your business",
    body: "A few questions about what you do, who you help, and the style you want.",
  },
  {
    icon: Wand2,
    title: "We write your pages",
    body: "AI writes the words, picks photos, and fills the design you chose.",
  },
  {
    icon: Globe,
    title: "Get your files or go live",
    body: "Download your website files, or we put the site online for you.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">How it works</span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground">
            From design to live site in four steps
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
  { icon: LayoutTemplate, label: "Welcome, services, about" },
  { icon: Sparkles, label: "Reviews & common questions" },
  { icon: ImageIcon, label: "Photos chosen for you" },
  { icon: Wand2, label: "Rewrite any section" },
];

function SectionsShowcase() {
  return (
    <section id="sections" className="relative overflow-hidden bg-neutral-5 py-24">
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">How we build it</span>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink">
              You answer. We write. You get a real website.
            </h2>
            <p className="mt-5 text-lg text-ink-muted">
              You don’t write any code. We fill a finished design with your words, photos,
              and colors — so every site is easy to read and easy to edit.
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
              <div className="relative aspect-[16/10] w-full bg-neutral-5">
                <Image
                  src="/marketing/editor-panel.png"
                  alt="The editor panel with brand controls on the left and a live website preview on the right"
                  fill
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="object-cover object-top"
                />
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
            Write with credits. Pay when you’re ready to go live.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Sign up and get free credits. Writing your site and rewriting a section uses
            credits. You only pay a package fee when you download your files or we put
            the site online.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="rounded-none border border-line bg-card p-8">
            <Coins className="h-8 w-8 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">Download your files</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Pay once. Download your website files and put them online yourself — on any
              host you like.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>• Website files you can upload anywhere</li>
              <li>• A saved copy of your site</li>
              <li>• Simple steps to put it online</li>
            </ul>
          </div>
          <div className="relative rounded-none border-2 border-primary-border bg-card p-8">
            <span className="absolute right-6 top-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Managed
            </span>
            <Rocket className="h-8 w-8 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">We put it online</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A setup fee plus a monthly hosting fee. We put your site online for you.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>• We put it online for you</li>
              <li>• Your site’s web address</li>
              <li>• We keep it running</li>
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
          Sign up, pick a design, answer a few questions, and watch Agency Partner
          Interactive's AI fill that design — free credits included.
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
