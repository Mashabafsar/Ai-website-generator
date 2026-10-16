import { betterAuth, APIError } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { grantSignupBonus } from "@/lib/credits/credits";
import { getAuthBaseURL, getAuthTrustedOrigins } from "@/lib/auth/config";
import { CrmScoreAction } from "@/lib/crm/config";
import { awardOneTimeAction, recordMarketingConsent } from "@/lib/crm/scoring";
import { scheduleCrmDrain } from "@/lib/crm/sync";
import { env } from "@/lib/env";
import { sendAccountVerificationEmail } from "@/lib/notify/verification";

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
    requireEmailVerification: env.notify.smtpEnabled,
  },
  emailVerification: {
    sendOnSignUp: env.notify.smtpEnabled,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAccountVerificationEmail({
        to: user.email,
        name: user.name,
        url,
      });
    },
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
          // Signup requires the marketing checkbox, and verification can
          // finish without a session — record consent here so it is not lost.
          // The registration score is also awarded from the consent call;
          // both paths share one idempotency key, so it only counts once.
          try {
            await recordMarketingConsent({
              userId: user.id,
              granted: true,
              mode: "register",
            });
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
