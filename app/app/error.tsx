"use client";

import { ErrorScreen, ERROR_TITLE } from "@/components/system/error-screen";

export default function AppErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorScreen
      embedded
      code="500"
      title={ERROR_TITLE}
      description="Try again, or go back to your dashboard and pick up where you left off."
      homeHref="/app/dashboard"
      homeLabel="Go to dashboard"
      secondaryHref="/app/templates"
      secondaryLabel="Browse designs"
      onRetry={reset}
    />
  );
}
