import { isSmtpConfigured, isSmtpSecure, parseSmtpPort, resolveSmtpFrom } from "@/lib/notify/config";

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
    // Kept under five minutes so a stuck model call is cancelled and the
    // deterministic fallback returns before the client gives up waiting.
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

  /** S3-compatible object storage (Garage on the VPS). */
  storage: {
    endpoint: process.env.S3_ENDPOINT ?? "",
    region: process.env.S3_REGION ?? "garage",
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    mediaBucket: process.env.S3_MEDIA_BUCKET ?? "media",
    sitesBucket: process.env.S3_SITES_BUCKET ?? "sites",
    /** Public origin of the media bucket, e.g. `https://media.example.com`. */
    publicUrl: (process.env.S3_PUBLIC_URL ?? "").trim().replace(/\/+$/, ""),
    get enabled() {
      return Boolean(
        process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
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

  /**
   * AES-256-GCM key for BillingRecord payloads. Prefer 32 raw bytes as base64
   * (44 chars) or 64 hex chars. Never store card PANs — only summaries.
   */
  billing: {
    encryptionKey: process.env.BILLING_ENCRYPTION_KEY ?? "",
    get enabled() {
      return Boolean(process.env.BILLING_ENCRYPTION_KEY?.trim());
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
    /** Stored on Deployment.provider. Publishing always uses the sites bucket. */
    provider: process.env.DEPLOYMENT_PROVIDER ?? "s3",
    /**
     * Parent hostname for managed sites, for example `sites.example.com`.
     * A published site is served at `https://<subdomain>.<PLATFORM_DOMAIN>`.
     */
    get platformDomain() {
      return (process.env.PLATFORM_DOMAIN ?? "").trim().replace(/^\.+|\.+$/g, "").toLowerCase();
    },
    /** Live publishing needs object storage and a platform domain. */
    get enabled() {
      return env.storage.enabled && Boolean(env.deployment.platformDomain);
    },
  },

  hubspot: {
    /** Everything is built from these, so a portal can move API versions without a code change. */
    apiKey: process.env.HUBSPOT_API_KEY ?? "",
    baseUrl: (process.env.HUBSPOT_API_BASE_URL ?? "https://api.hubapi.com").replace(/\/+$/, ""),
    apiVersion: process.env.HUBSPOT_API_VERSION ?? "2026-09",
    associationsApiVersion: process.env.HUBSPOT_ASSOCIATIONS_API_VERSION ?? "2026-09",
    /**
     * Deal pipeline id. Default is this portal's custom pipeline (`941017774`).
     * Override when pointing at another HubSpot account.
     */
    dealPipeline: process.env.HUBSPOT_DEAL_PIPELINE ?? "",
    /**
     * @deprecated Stages are resolved from account progress via `DealStage` in
     * `lib/crm/config.ts`. Kept only so older env files still parse.
     */
    dealStage: process.env.HUBSPOT_DEAL_STAGE ?? "",
    /**
     * @deprecated Open stages are Preview Generated / Content Generation /
     * Credit Bought / Quotation Generated from progress. Kept for older env files.
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
    get fromEmail() {
      return resolveSmtpFrom({
        fromEmail: process.env.NOTIFY_FROM_EMAIL,
        smtpUser: process.env.SMTP_USER,
      });
    },
    smtpHost: process.env.SMTP_HOST ?? "",
    smtpPort: parseSmtpPort(process.env.SMTP_PORT),
    smtpUser: process.env.SMTP_USER ?? "",
    smtpPass: process.env.SMTP_PASS ?? "",
    get smtpSecure() {
      return isSmtpSecure(this.smtpPort, process.env.SMTP_SECURE);
    },
    get smtpEnabled() {
      return isSmtpConfigured({
        host: process.env.SMTP_HOST,
        fromEmail: process.env.NOTIFY_FROM_EMAIL,
        smtpUser: process.env.SMTP_USER,
      });
    },
    get enabled() {
      return this.smtpEnabled;
    },
  },
};
