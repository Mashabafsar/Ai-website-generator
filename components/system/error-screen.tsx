"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BrandMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { cn } from "@/lib/utils";

export const NOT_FOUND_TITLE = "This page isn’t here";
export const ERROR_TITLE = "This page didn’t load";
export const ERROR_DESCRIPTION =
  "Try again, or go home and pick up where you left off.";

export type ErrorScreenProps = {
  code: string;
  title: string;
  description: string;
  homeHref: string;
  homeLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  onRetry?: () => void;
  retryLabel?: string;
  embedded?: boolean;
};

function StageDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <BrandMark idPrefix="errFloatA" className="system-float-mark left-[7%] top-[16%] h-16 opacity-20" />
      <BrandMark idPrefix="errFloatB" className="system-float-mark right-[9%] top-[22%] h-11 opacity-[0.18]" />
      <BrandMark idPrefix="errFloatC" className="system-float-mark bottom-[18%] left-[16%] h-8 opacity-15" />
    </div>
  );
}

function CodeStage({ code }: { code: string }) {
  const glyphs = Array.from(code);
  return (
    <div className="system-stage relative flex min-h-[48vh] items-end justify-center overflow-hidden px-6 pb-10 pt-20 sm:min-h-[56vh] sm:pb-14">
      <StageDecor />
      <div className="relative">
        <p
          className="relative mx-auto flex justify-center select-none font-display text-[clamp(4.5rem,14vw,9rem)] font-extrabold leading-none tracking-[-0.06em] text-white tabular-nums"
          aria-hidden
        >
          {glyphs.map((glyph, index) => (
            <span key={`${glyph}-${index}`} className="system-digit px-[0.02em]">
              {glyph}
            </span>
          ))}
        </p>
        <BrandMark
          idPrefix="errSearch"
          className="system-searcher pointer-events-none absolute left-1/2 top-0 z-10 h-9 w-auto drop-shadow-md sm:h-11"
        />
      </div>
    </div>
  );
}

function Actions({
  homeHref,
  homeLabel,
  secondaryHref,
  secondaryLabel,
  onRetry,
  retryLabel = "Try again",
}: Pick<
  ErrorScreenProps,
  "homeHref" | "homeLabel" | "secondaryHref" | "secondaryLabel" | "onRetry" | "retryLabel"
>) {
  return (
    <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      {onRetry ? (
        <Button variant="brand" size="lg" onClick={onRetry} className="active:scale-[0.97]">
          {retryLabel}
        </Button>
      ) : null}
      <Button asChild variant={onRetry ? "outline" : "brand"} size="lg" className="group active:scale-[0.97]">
        <Link href={homeHref}>
          {homeLabel}
          <ChevronRight className="transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
        </Link>
      </Button>
      {secondaryHref && secondaryLabel ? (
        <Button asChild variant="ghost" size="lg" className="active:scale-[0.97]">
          <Link href={secondaryHref}>{secondaryLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}

function CopyBlock(props: ErrorScreenProps) {
  return (
    <div className={cn("mx-auto max-w-xl px-6 py-12 text-center", props.embedded && "py-8")}>
      <h1 className="animate-fade-up font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        <span className="sr-only">{props.code}. </span>
        {props.title}
      </h1>
      <p className="animate-fade-up mx-auto mt-4 max-w-md text-base leading-7 text-ink-muted">
        {props.description}
      </p>
      <Actions {...props} />
    </div>
  );
}

export function ErrorScreen(props: ErrorScreenProps) {
  const { code, embedded } = props;

  if (embedded) {
    return (
      <Card className="overflow-hidden">
        <CodeStage code={code} />
        <CopyBlock {...props} />
      </Card>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main>
        <CodeStage code={code} />
        <CopyBlock {...props} />
      </main>
      <SiteFooter />
    </div>
  );
}
