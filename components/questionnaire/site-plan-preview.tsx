"use client";

import { Loader2, Sparkles } from "lucide-react";
import type { SitePlanView } from "@/lib/agents/website-planner";

export function SitePlanPreview({
  plan,
  loading,
  multiPage,
}: {
  plan: SitePlanView | null;
  loading: boolean;
  multiPage: boolean;
}) {
  if (loading && !plan) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border bg-muted/30 p-4">
        <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-muted-foreground" />
        <div>
          <p className="font-medium">Figuring out the right site for you</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;re reading your answers and choosing pages that fit who you serve. You
            don&apos;t need to pick anything.
          </p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <p className="text-sm text-muted-foreground">
        We&apos;ll choose the pages and sections from what you told us when you generate.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <div>
          <p className="font-medium">We&apos;ll put this together for you</p>
          <p className="mt-1 text-sm text-muted-foreground">{plan.summary}</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Who it&apos;s for
        </p>
        <p className="mt-1 text-sm leading-relaxed">{plan.audience}</p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {multiPage ? "Pages we'll include" : "What we'll put on the page"}
        </p>
        {plan.pages.map((page) => (
          <div key={page.slug} className="rounded-2xl border bg-card p-4">
            <p className="font-medium">{page.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{page.why}</p>
            {page.sections.length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                {page.sections.join(" · ")}
              </p>
            )}
          </div>
        ))}
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Updating the plan from your latest answers…
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          You can change the wording after we write it. You don&apos;t need to pick
          pages yourself.
        </p>
      )}
    </div>
  );
}
