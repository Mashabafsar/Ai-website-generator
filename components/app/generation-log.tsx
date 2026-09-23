"use client";

import { Check, Loader2 } from "lucide-react";
import { GENERATION_STEPS, type GenerationStepId } from "@/lib/ai/generation-steps";
import { cn } from "@/lib/utils";

/** Live checklist for a website build. Finished lines stay, the current one spins. */
export function GenerationLog({ activeId }: { activeId: GenerationStepId | "done" | null }) {
  const activeIndex =
    activeId === "done"
      ? GENERATION_STEPS.length
      : GENERATION_STEPS.findIndex((step) => step.id === activeId);

  return (
    <ol className="space-y-3 py-2" aria-live="polite">
      {GENERATION_STEPS.map((step, index) => {
        const done = activeIndex > index;
        const active = step.id === activeId;
        return (
          <li
            key={step.id}
            className={cn(
              "flex items-center gap-3 text-sm transition-colors",
              done || active ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <span className="grid size-4 shrink-0 place-items-center">
              {done ? (
                <Check className="size-4 text-primary" />
              ) : active ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <span className="size-1.5 rounded-full bg-muted-foreground/40" />
              )}
            </span>
            <span className={cn(active && "font-medium")}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
