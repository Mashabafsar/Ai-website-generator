import { ErrorScreen, NOT_FOUND_TITLE } from "@/components/system/error-screen";

export default function AppNotFound() {
  return (
    <ErrorScreen
      embedded
      code="404"
      title={NOT_FOUND_TITLE}
      description="It was moved, deleted, or never existed. Go back to your dashboard, or pick a design."
      homeHref="/app/dashboard"
      homeLabel="Go to dashboard"
      secondaryHref="/app/templates"
      secondaryLabel="Browse designs"
    />
  );
}
