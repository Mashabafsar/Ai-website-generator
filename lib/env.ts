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
  appUrl: (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, ""),

  ai: {
    cursorApiKey: process.env.CURSOR_API_KEY ?? "",
    heavyModel: process.env.HEAVY_MODEL_NAME ?? "claude-opus-5",
    lightModel: process.env.LIGHT_MODEL_NAME ?? "composer-2.5",
    // Vercel Hobby kills serverless functions at 300s, so these waits stay
    // under that. Leave a little room to cancel Cursor and return a fallback
    // instead of an abrupt platform timeout.
    cursorTimeoutMs: num(process.env.CURSOR_TIMEOUT_MS, 270_000),
    cursorLightTimeoutMs: num(process.env.CURSOR_LIGHT_TIMEOUT_MS, 270_000),
    // Explicit mock mode only. When false: Cursor, then a deterministic template.
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
    vision: {
      // Looks at candidate and imported photos before placing them. Off, or
      // without a Cursor key, placement falls back to the providers' own
      // photo descriptions.
      enabled: bool(process.env.IMAGE_VISION_ENABLED, true),
      model: process.env.VISION_MODEL_NAME ?? process.env.HEAVY_MODEL_NAME ?? "claude-opus-5",
      timeoutMs: num(process.env.IMAGE_VISION_TIMEOUT_MS, 90_000),
      /** Most photos sent in one analysis call. */
      maxImages: num(process.env.IMAGE_VISION_MAX_IMAGES, 36),
    },
  },

  supabase: {
    url: process.env.SUPABASE_URL ?? "",
    serviceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "",
    storageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? "scraped-assets",
    get enabled() {
      return Boolean(
        process.env.SUPABASE_URL &&
          (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)
      );
    },
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
    selfHostingPriceId: process.env.STRIPE_SELF_HOSTING_PRICE_ID ?? "",
    managedCreationPriceId: process.env.STRIPE_MANAGED_CREATION_PRICE_ID ?? "",
    managedMonthlyPriceId: process.env.STRIPE_MANAGED_MONTHLY_PRICE_ID ?? "",
    creditPackSmall: process.env.STRIPE_CREDIT_PACK_SMALL_PRICE_ID ?? "",
    creditPackMedium: process.env.STRIPE_CREDIT_PACK_MEDIUM_PRICE_ID ?? "",
    creditPackLarge: process.env.STRIPE_CREDIT_PACK_LARGE_PRICE_ID ?? "",
    get enabled() {
      return Boolean(process.env.STRIPE_SECRET_KEY);
    },
  },

  github: {
    token: process.env.GITHUB_TOKEN ?? "",
    org: process.env.GITHUB_ORG ?? "",
    /** Optional `owner/repo`. Defaults to `${GITHUB_ORG}/AI-WEBSITE-BUILDER-WEBSITE`. */
    sitesRepo: process.env.GITHUB_SITES_REPO ?? "",
    visibility: (process.env.GITHUB_REPO_VISIBILITY ?? "private") as "private" | "public",
    get enabled() {
      return Boolean(process.env.GITHUB_TOKEN);
    },
    /** Paid sites are committed here. Null when owner/repo cannot be resolved. */
    get sitesTarget(): { owner: string; repo: string } | null {
      const explicit = (process.env.GITHUB_SITES_REPO ?? "").trim();
      if (explicit.includes("/")) {
        const [owner, repo, extra] = explicit.split("/");
        if (owner && repo && !extra) return { owner, repo };
      }
      const org = process.env.GITHUB_ORG ?? "";
      if (org) return { owner: org, repo: "AI-WEBSITE-BUILDER-WEBSITE" };
      return null;
    },
  },

  deployment: {
    provider: process.env.DEPLOYMENT_PROVIDER ?? "vercel",
    token: process.env.DEPLOYMENT_TOKEN ?? "",
    teamId: process.env.DEPLOYMENT_TEAM_ID || process.env.VERCEL_TEAM_ID || process.env.VERCEL_ORG_ID || "",
    // Testing uses Vercel's assigned host (`*.vercel.app`). Leave this empty
    // until a real custom domain exists — do not default to agencypartner.site.
    platformDomain: (process.env.PLATFORM_DOMAIN ?? "").trim(),
    get enabled() {
      return Boolean(process.env.DEPLOYMENT_TOKEN);
    },
  },

  hubspot: {
    /** Everything is built from these, so a portal can move API versions without a code change. */
    apiKey: process.env.HUBSPOT_API_KEY ?? "",
    baseUrl: (process.env.HUBSPOT_API_BASE_URL ?? "https://api.hubapi.com").replace(/\/+$/, ""),
    apiVersion: process.env.HUBSPOT_API_VERSION ?? "2026-09",
    associationsApiVersion: process.env.HUBSPOT_ASSOCIATIONS_API_VERSION ?? "2026-09",
    /** Deal placement. Left blank, HubSpot uses Sales Pipeline (`default`). */
    dealPipeline: process.env.HUBSPOT_DEAL_PIPELINE ?? "",
    /** Closed Won stage after a website package is paid. Default `closedwon`. */
    dealStage: process.env.HUBSPOT_DEAL_STAGE ?? "",
    /**
     * Open-deal stage from questionnaire until the website is paid.
     * Default HubSpot id `qualifiedtobuy` (Qualified To Buy).
     */
    dealOpenStage: process.env.HUBSPOT_DEAL_OPEN_STAGE ?? "",
    /** Lead placement. Blank means look up the portal's lead pipeline and its
     * "New" stage at sync time — HubSpot stage ids differ per portal.
     */
    leadPipeline: process.env.HUBSPOT_LEAD_PIPELINE ?? "",
    leadNewStage: process.env.HUBSPOT_LEAD_NEW_STAGE ?? "",
    /** Blank: find the stage labelled "Closed Won" in the lead pipeline, creating it if missing. */
    leadClosedWonStage: process.env.HUBSPOT_LEAD_CLOSED_WON_STAGE ?? "",
    /**
     * Owner (seat) every new Lead is assigned to. Required for the lead to
     * show up under "My leads" in HubSpot Sales. Blank leaves leads unassigned.
     * Read live so a backfill can set the env without restarting the process.
     */
    get leadOwnerId() {
      return process.env.HUBSPOT_LEAD_OWNER_ID ?? "";
    },
    /**
     * Internal name of the Lead Score column on the HubSpot leads object.
     * Default matches the portal property created for this project.
     */
    get leadScoreProperty() {
      return process.env.HUBSPOT_LEAD_SCORE_PROPERTY?.trim() || "lead_score";
    },
    requestTimeoutMs: num(process.env.HUBSPOT_REQUEST_TIMEOUT_MS, 15_000),
    /** Extra in-request tries for blips. Longer outages are the outbox's job. */
    requestRetries: num(process.env.HUBSPOT_REQUEST_RETRIES, 2),
    /** Outbox attempts before a job is parked as FAILED. */
    maxJobAttempts: num(process.env.HUBSPOT_MAX_JOB_ATTEMPTS, 6),
    get enabled() {
      return Boolean(process.env.HUBSPOT_API_KEY);
    },
  },

  cron: {
    /** Shared secret for the scheduled CRM drain. Blank disables the endpoint. */
    secret: process.env.CRON_SECRET ?? "",
  },

  notify: {
    resendApiKey: process.env.RESEND_API_KEY ?? "",
    fromEmail: process.env.NOTIFY_FROM_EMAIL ?? "",
    get enabled() {
      return Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_FROM_EMAIL);
    },
  },
};
