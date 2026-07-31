import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/lib/auth/auth";

/** Server-side current session (cached per request). */
export const getCurrentSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/** Returns the current user id or null. */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getCurrentSession();
  return session?.user?.id ?? null;
}
