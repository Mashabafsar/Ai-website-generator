import { BrandMark } from "@/components/brand/logo";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STATUS_LINES = ["Choosing a layout", "Writing your pages", "Finding photos"] as const;

function AssemblingMark() {
  return (
    <div className="relative mx-auto grid size-[5.75rem] place-items-center">
      <span
        aria-hidden
        className="loading-orbit pointer-events-none absolute inset-[-14px] rounded-full border border-dashed border-primary/40"
      />
      <svg
        viewBox="0 0 70 53"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative h-12 w-auto"
        aria-hidden
      >
        <path
          className="loading-mark-a"
          d="M35.115 42.342V0L2.96729 42.342H35.115Z"
          fill="url(#loadMarkA)"
        />
        <path
          className="loading-mark-b"
          d="M37.7319 9.32422V51.6675L69.8809 9.32422H37.7319Z"
          fill="url(#loadMarkB)"
        />
        <defs>
          <linearGradient id="loadMarkA" x1="-4.7" y1="46" x2="64.3" y2="3.9" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7313FF" />
            <stop offset="0.43" stopColor="#5D48FD" />
            <stop offset="0.83" stopColor="#38A5F8" />
            <stop offset="1" stopColor="#24D5F6" />
          </linearGradient>
          <linearGradient id="loadMarkB" x1="-3.4" y1="56" x2="65.6" y2="14" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7313FF" />
            <stop offset="0.43" stopColor="#5D48FD" />
            <stop offset="0.83" stopColor="#38A5F8" />
            <stop offset="1" stopColor="#24D5F6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function SiteSketch() {
  return (
    <Card className="mx-auto mt-8 w-full max-w-[18.5rem] overflow-hidden shell-card-shadow">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
        <span className="loading-dot size-2 rounded-full bg-error-main/70" />
        <span className="loading-dot size-2 rounded-full bg-secondary-main/80" />
        <span className="loading-dot size-2 rounded-full bg-success-main/70" />
      </div>
      <div className="space-y-2.5 bg-neutral-5 p-3">
        <div className="loading-skel-bar h-14 w-full bg-gradient-to-r from-white via-primary-surface to-white animate-shimmer" />
        <div className="flex gap-2">
          <div className="loading-skel-bar h-8 flex-1 bg-white" />
          <div className="loading-skel-bar h-8 flex-1 bg-white" />
          <div className="loading-skel-bar h-8 flex-1 bg-white" />
        </div>
      </div>
    </Card>
  );
}

export function LoadingScreen({ embedded = false }: { embedded?: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden bg-white",
        embedded ? "min-h-[28rem]" : "min-h-screen"
      )}
    >
      {!embedded ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden [perspective:220px]"
        >
          <div className="absolute inset-0 [transform:rotateX(65deg)]">
            <div className="animate-retro-grid absolute inset-x-[-200%] top-0 h-[300vh] w-[600vw] origin-top-right bg-[linear-gradient(to_right,rgba(77,113,251,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(77,113,251,0.16)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent" />
        </div>
      ) : null}

      <div className="animate-fade-up relative z-10 w-full max-w-md px-6 text-center">
        <AssemblingMark />
        <p className="sr-only">Loading</p>
        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-ink">
          Putting the page together
        </h1>
        <p className="loading-status mt-2 text-sm text-ink-muted" aria-hidden>
          {STATUS_LINES.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
        <SiteSketch />
      </div>

      {!embedded ? (
        <BrandMark
          idPrefix="loadBg"
          className="system-float-mark bottom-[12%] right-[10%] h-14 opacity-[0.12]"
        />
      ) : null}
    </div>
  );
}
