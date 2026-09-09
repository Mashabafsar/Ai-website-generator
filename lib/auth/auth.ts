import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { grantSignupBonus } from "@/lib/credits/credits";
import { getAuthBaseURL, getAuthTrustedOrigins } from "@/lib/auth/config";

export const auth = betterAuth({
  appName: "Agency Partner AI Website Builder",
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: getAuthBaseURL(),
  trustedOrigins: getAuthTrustedOrigins(),
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
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
