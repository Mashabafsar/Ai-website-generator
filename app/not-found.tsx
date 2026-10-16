import { ErrorScreen, NOT_FOUND_TITLE } from "@/components/system/error-screen";
import { getCurrentUserId } from "@/lib/auth/session";

export const metadata = {
  title: "Page not found",
};

export default async function NotFound() {
  const userId = await getCurrentUserId();
  const signedIn = Boolean(userId);

  return (
    <ErrorScreen
      code="404"
      title={NOT_FOUND_TITLE}
      description="It was moved, deleted, or never existed. Go home, or start from a finished design."
      homeHref={signedIn ? "/app/dashboard" : "/"}
      homeLabel={signedIn ? "Go to dashboard" : "Go to homepage"}
      secondaryHref={signedIn ? "/app/templates" : "/signup"}
      secondaryLabel={signedIn ? "Browse designs" : "Start building"}
    />
  );
}
