"use client";

import { ErrorScreen, ERROR_DESCRIPTION, ERROR_TITLE } from "@/components/system/error-screen";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorScreen
      code="500"
      title={ERROR_TITLE}
      description={ERROR_DESCRIPTION}
      homeHref="/"
      homeLabel="Go to homepage"
      secondaryHref="/signup"
      secondaryLabel="Start building"
      onRetry={reset}
    />
  );
}
