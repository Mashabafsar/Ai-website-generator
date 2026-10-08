import { betterAuth, APIError } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { grantSignupBonus } from "@/lib/credits/credits";
import { getAuthBaseURL, getAuthTrustedOrigins } from "@/lib/auth/config";
import { CrmScoreAction } from "@/lib/crm/config";
import { awardOneTimeAction } from "@/lib/crm/scoring";
import { scheduleCrmDrain } from "@/lib/crm/sync";

const DEACTIVATED_MESSAGE =
  "This account has been deactivated because it had no website or credit purchase within 14 days. Contact support if you need access.";

export const auth = betterAuth({
  appName: "Agency Partner AI Website Builder",
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: getAuthBaseURL(),
  trustedOrigins: (request) => getAuthTrustedOrigins(request),
  emailAndPassword: {
    enabled: true,
    // Keep the MVP friction-free; email verification can be layered on later.
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh daily
  },
  databaseHooks: {
    user: {
      create: {
        // Every new registration receives starter credits (idempotent per user).
        after: async (user) => {
          await grantSignupBonus(user.id);
          // Scored here as well as from the consent call, so an account still
          // registers a lead score if the browser never makes that request.
          // Both paths share one idempotency key, so it only counts once.
          try {
            await awardOneTimeAction(user.id, CrmScoreAction.REGISTERED);
            scheduleCrmDrain();
          } catch (err) {
            console.error("[crm] registration score failed:", err instanceof Error ? err.message : err);
          }
        },
      },
    },
    session: {
      create: {
        // Deactivated accounts cannot open a new session (login / refresh).
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { deactivatedAt: true },
          });
          if (user?.deactivatedAt) {
            throw new APIError("FORBIDDEN", {
              message: DEACTIVATED_MESSAGE,
              code: "ACCOUNT_DEACTIVATED",
            });
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
