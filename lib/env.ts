// Centralized, typed access to environment variables with sensible defaults.
// Server-only secrets must never be imported into client components.

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function bool(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return value === "true" || value === "1";
}

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  ai: {
    cursorApiKey: process.env.CURSOR_API_KEY ?? "",
    heavyModel: process.env.HEAVY_MODEL_NAME ?? "claude-opus-5",
    lightModel: process.env.LIGHT_MODEL_NAME ?? "composer-2.5",
    // Gemini is the fallback when Cursor fails (or when Cursor isn't configured).
    geminiApiKey: process.env.GEMINI_API_KEY ?? "",
    geminiModel: process.env.GEMINI_MODEL_NAME ?? "gemini-2.5-flash",
    // How long to wait on Cursor before falling through to Gemini (ms). Set high
    // so website generation prefers the primary Cursor model; users may wait
    // longer before content appears. Edits keep a shorter cap (see provider.ts).
    cursorTimeoutMs: num(process.env.CURSOR_TIMEOUT_MS, 60_000),
    // Explicit mock mode only. When false, the FallbackAiProvider chain runs:
    // Cursor → Gemini → deterministic template.
    useMock: bool(process.env.AI_USE_MOCK, false),
  },

  credits: {
    signupBonus: num(process.env.SIGNUP_CREDIT_BONUS, 70),
    costHeavyGenerate: num(process.env.CREDIT_COST_HEAVY_GENERATE, 50),
    costLightEdit: num(process.env.CREDIT_COST_LIGHT_EDIT, 5),
    costScrapeImport: num(process.env.CREDIT_COST_SCRAPE_IMPORT, 10),
  },

  admin: {
    // Comma-separated emails allowed into /app/admin. In development any signed-in
    // user is allowed so the admin tools are reachable without extra setup.
    emails: (process.env.ADMIN_EMAILS ?? "admin@admin.com")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  },

  images: {
    shutterstock: process.env.SHUTTERSTOCK_API_TOKEN ?? "",
    pexels: process.env.PEXELS_API_KEY ?? "",
    unsplash: process.env.UNSPLASH_ACCESS_KEY ?? "",
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
    selfHostingPriceId: process.env.STRIPE_SELF_HOSTING_PRICE_ID ?? "",
    managedCreationPriceId: process.env.STRIPE_MANAGED_CREATION_PRICE_ID ?? "",
    managedMonthlyPriceId: process.env.STRIPE_MANAGED_MONTHLY_PRICE_ID ?? "",
    creditPack100: process.env.STRIPE_CREDIT_PACK_100_PRICE_ID ?? "",
    creditPack300: process.env.STRIPE_CREDIT_PACK_300_PRICE_ID ?? "",
    creditPack1000: process.env.STRIPE_CREDIT_PACK_1000_PRICE_ID ?? "",
    get enabled() {
      return Boolean(process.env.STRIPE_SECRET_KEY);
    },
  },

  github: {
    token: process.env.GITHUB_TOKEN ?? "",
    org: process.env.GITHUB_ORG ?? "",
    visibility: (process.env.GITHUB_REPO_VISIBILITY ?? "private") as "private" | "public",
    get enabled() {
      return Boolean(process.env.GITHUB_TOKEN);
    },
  },

  deployment: {
    provider: process.env.DEPLOYMENT_PROVIDER ?? "vercel",
    token: process.env.DEPLOYMENT_TOKEN ?? "",
    platformDomain: process.env.PLATFORM_DOMAIN ?? "agencypartner.site",
    get enabled() {
      return Boolean(process.env.DEPLOYMENT_TOKEN);
    },
  },

  hubspot: {
    accessToken: process.env.HUBSPOT_ACCESS_TOKEN ?? "",
    get enabled() {
      return Boolean(process.env.HUBSPOT_ACCESS_TOKEN);
    },
  },

  notify: {
    resendApiKey: process.env.RESEND_API_KEY ?? "",
    fromEmail: process.env.NOTIFY_FROM_EMAIL ?? "",
    get enabled() {
      return Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_FROM_EMAIL);
    },
  },
};
