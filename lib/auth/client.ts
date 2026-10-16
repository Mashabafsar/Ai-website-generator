"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Use same-origin `/api/auth` so sign-in/out works on any dev port
 * (e.g. 3002 when 3000 is busy). Absolute NEXT_PUBLIC_APP_URL breaks cookies.
 */
export const authClient = createAuthClient({
  basePath: "/api/auth",
});

export const { signIn, signUp, signOut, useSession, getSession, sendVerificationEmail } =
  authClient;
