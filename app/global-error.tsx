"use client";

import type { CSSProperties } from "react";
import { ErrorScreen, ERROR_DESCRIPTION, ERROR_TITLE } from "@/components/system/error-screen";
import "./globals.css";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html
      lang="en"
      style={{ "--font-onest": "'Onest', ui-sans-serif, system-ui, sans-serif" } as CSSProperties}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=block"
        />
      </head>
      <body>
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
      </body>
    </html>
  );
}
