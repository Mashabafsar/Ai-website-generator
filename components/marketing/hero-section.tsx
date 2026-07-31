import type { CSSProperties, HTMLAttributes } from "react";
import Link from "next/link";
import { ChevronRight, LayoutTemplate, Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

type HeroSectionProps = HTMLAttributes<HTMLElement> & {
  eyebrow?: string;
  title?: string;
  gradientTitle?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  gridOptions?: {
    angle?: number;
    cellSize?: number;
    opacity?: number;
    lineColor?: string;
  };
};

function RetroGrid({
  angle = 65,
  cellSize = 60,
  opacity = 0.38,
  lineColor = "rgba(115, 19, 255, 0.35)",
}: NonNullable<HeroSectionProps["gridOptions"]>) {
  const styles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--grid-opacity": opacity,
    "--grid-line": lineColor,
  } as CSSProperties;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden [perspective:220px]"
      style={styles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-retro-grid absolute inset-x-[-200%] top-0 h-[300vh] w-[600vw] origin-top-right bg-[linear-gradient(to_right,var(--grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-line)_1px,transparent_1px)] bg-[size:var(--cell-size)_var(--cell-size)] opacity-[var(--grid-opacity)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-transparent" />
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto mt-20 max-w-5xl px-4 sm:px-8">
      <div className="absolute inset-x-16 -top-10 h-32 rounded-full bg-brand-violet/30 blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/95 shadow-[0_30px_100px_rgba(5,4,30,0.65)]">
        <div className="flex items-center gap-2 border-b border-border bg-white px-4 py-3">
          <span className="size-2.5 rounded-full bg-brand-violet/50" />
          <span className="size-2.5 rounded-full bg-brand-blue/50" />
          <span className="size-2.5 rounded-full bg-brand-cyan/60" />
          <div className="mx-auto h-6 w-2/5 rounded-md bg-muted" />
        </div>

        <div className="grid min-h-72 md:grid-cols-[220px_1fr]">
          <aside className="hidden border-r bg-muted/50 p-5 md:block">
            <div className="mb-6 h-7 w-28 rounded-md brand-gradient" />
            <div className="flex flex-col gap-3">
              {["Hero", "Services", "About", "Testimonials", "Contact"].map((item, index) => (
                <div
                  key={item}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium",
                    index === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  <span className="size-2 rounded-full bg-current opacity-60" />
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <div className="p-5 sm:p-8">
            <div className="relative overflow-hidden rounded-xl bg-brand-navy px-6 py-10 text-center">
              <div className="grid-texture absolute inset-0 opacity-40" />
              <div className="relative mx-auto max-w-lg">
                <div className="mx-auto mb-4 h-3 w-24 rounded-full bg-brand-cyan/50" />
                <div className="mx-auto h-6 w-4/5 rounded-md bg-white/90 sm:h-8" />
                <div className="mx-auto mt-3 h-3 w-3/5 rounded bg-white/30" />
                <div className="mx-auto mt-6 h-9 w-32 rounded-full brand-gradient" />
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                { icon: LayoutTemplate, label: "Curated sections" },
                { icon: Sparkles, label: "AI-written copy" },
                { icon: Wand2, label: "Live editing" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-xl border bg-card p-4">
                  <Icon className="mb-3 size-5 text-primary" />
                  <div className="h-2.5 w-3/4 rounded bg-foreground/15" />
                  <p className="mt-2 text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection({
  className,
  eyebrow = "AI Website Builder by Agency Partner Interactive",
  title = "A launch-ready website,",
  gradientTitle = " generated in minutes.",
  description = "Answer a short questionnaire and our AI assembles a complete single-page website from a curated component system — copy, layout, and images included.",
  ctaText = "Start building free",
  ctaHref = "/signup",
  gridOptions,
  ...props
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "hero-aurora relative isolate overflow-hidden px-4 pb-24 pt-36 sm:px-6 sm:pt-44",
        className
      )}
      {...props}
    >
      <div className="absolute inset-x-0 top-0 h-screen bg-[radial-gradient(ellipse_35%_70%_at_50%_-15%,rgba(115,19,255,0.5),transparent)]" />
      <RetroGrid {...gridOptions} />

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="animate-fade-up mx-auto flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur">
          <Sparkles className="size-3.5 text-brand-cyan" />
          {eyebrow}
          <ChevronRight className="size-3.5" />
        </div>

        <h1 className="animate-fade-up mt-7 font-display text-5xl font-bold leading-[1.03] tracking-[-0.045em] text-white sm:text-6xl md:text-7xl">
          {title}
          <span className="brand-text-gradient">{gradientTitle}</span>
        </h1>

        <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
          {description}
        </p>

        <div className="animate-fade-up mt-9 flex flex-col items-center gap-4">
          <span className="relative inline-flex overflow-hidden rounded-full p-px">
            <span className="absolute inset-[-500%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#24D5F6_0%,#7313FF_45%,#E2CBFF_70%,#24D5F6_100%)]" />
            <Link
              href={ctaHref}
              className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-brand-navy px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90"
            >
              {ctaText}
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </span>
          <p className="text-xs text-white/45">Free credits included. No card required.</p>
        </div>
      </div>

      <ProductPreview />
    </section>
  );
}
