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
  opacity = 0.3,
  lineColor = "rgba(77, 113, 251, 0.18)",
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
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto mt-20 max-w-5xl px-4 sm:px-8">
      <div className="absolute inset-x-16 -top-10 h-32 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-none border border-line bg-white shell-card-shadow">
        <div className="flex items-center gap-2 border-b border-line bg-white px-4 py-3">
          <span className="size-2.5 rounded-full bg-error-main/60" />
          <span className="size-2.5 rounded-full bg-secondary-main/70" />
          <span className="size-2.5 rounded-full bg-success-main/60" />
          <div className="mx-auto h-6 w-2/5 rounded-md bg-neutral-5" />
        </div>

        <div className="grid min-h-72 md:grid-cols-[220px_1fr]">
          <aside className="hidden border-r border-line bg-neutral-5/50 p-5 md:block">
            <div className="mb-6 h-7 w-28 rounded-md bg-primary" />
            <div className="flex flex-col gap-3">
              {["Hero", "Services", "About", "Testimonials", "Contact"].map((item, index) => (
                <div
                  key={item}
                  className={cn(
                    "flex items-center gap-3 rounded px-3 py-2 text-xs font-medium",
                    index === 0 ? "bg-primary-surface text-primary" : "text-muted-foreground"
                  )}
                >
                  <span className="size-2 rounded-full bg-current opacity-60" />
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <div className="p-5 sm:p-8">
            <div className="relative overflow-hidden rounded-none border border-line bg-primary-surface px-6 py-10 text-center">
              <div className="relative mx-auto max-w-lg">
                <div className="mx-auto mb-4 h-3 w-24 rounded-full bg-primary/30" />
                <div className="mx-auto h-6 w-4/5 rounded-md bg-ink/80 sm:h-8" />
                <div className="mx-auto mt-3 h-3 w-3/5 rounded bg-ink/25" />
                <div className="mx-auto mt-6 h-9 w-32 rounded-none bg-primary" />
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                { icon: LayoutTemplate, label: "Curated sections" },
                { icon: Sparkles, label: "AI-written copy" },
                { icon: Wand2, label: "Live editing" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-none border border-line bg-card p-4">
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
        "relative isolate overflow-hidden bg-white px-4 pb-24 pt-36 sm:px-6 sm:pt-44",
        className
      )}
      {...props}
    >
      <div className="absolute inset-x-0 top-0 h-screen bg-[radial-gradient(ellipse_35%_70%_at_50%_-15%,rgba(77,113,251,0.12),transparent)]" />
      <RetroGrid {...gridOptions} />

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="animate-fade-up mx-auto flex w-fit items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-xs font-medium text-ink-muted">
          <Sparkles className="size-3.5 text-primary" />
          {eyebrow}
          <ChevronRight className="size-3.5" />
        </div>

        <h1 className="animate-fade-up mt-7 font-display text-5xl font-bold leading-[1.03] tracking-[-0.045em] text-ink sm:text-6xl md:text-7xl">
          {title}
          <span className="text-primary">{gradientTitle}</span>
        </h1>

        <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-base leading-7 text-ink-muted sm:text-lg">
          {description}
        </p>

        <div className="animate-fade-up mt-9 flex flex-col items-center gap-4">
          <Link
            href={ctaHref}
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-none bg-primary px-8 text-[15px] font-normal text-primary-foreground transition-colors hover:bg-primary-hover active:bg-primary-pressed"
          >
            {ctaText}
            <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="text-xs text-ink-muted">Free credits included. No card required.</p>
        </div>
      </div>

      <ProductPreview />
    </section>
  );
}
