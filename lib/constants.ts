// Enum-like constants. SQLite has no native enums, so these string unions are the
// single source of truth for allowed status/type values across the app.

export const ProjectStatus = {
  DRAFT: "DRAFT",
  GENERATING: "GENERATING",
  GENERATED: "GENERATED",
  QUOTED: "QUOTED",
  PAID: "PAID",
  EXPORTED: "EXPORTED",
  DEPLOYING: "DEPLOYING",
  LIVE: "LIVE",
  FAILED: "FAILED",
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const PackageType = {
  SELF_HOSTING: "SELF_HOSTING",
  MANAGED_HOSTING: "MANAGED_HOSTING",
} as const;
export type PackageType = (typeof PackageType)[keyof typeof PackageType];

export const PaymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentType = {
  WEBSITE_PACKAGE: "website_package",
  CREDIT_PACK: "credit_pack",
} as const;
export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];

export const DeploymentStatus = {
  PENDING: "PENDING",
  REPOSITORY_CREATED: "REPOSITORY_CREATED",
  BUILD_STARTED: "BUILD_STARTED",
  DEPLOYED: "DEPLOYED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const;
export type DeploymentStatus = (typeof DeploymentStatus)[keyof typeof DeploymentStatus];

export const GithubSyncStatus = {
  PENDING: "PENDING",
  SYNCED: "SYNCED",
  FAILED: "FAILED",
} as const;
export type GithubSyncStatus = (typeof GithubSyncStatus)[keyof typeof GithubSyncStatus];

export const CreditLedgerReason = {
  SIGNUP_BONUS: "SIGNUP_BONUS",
  PURCHASE: "PURCHASE",
  HEAVY_GENERATE: "HEAVY_GENERATE",
  LIGHT_EDIT: "LIGHT_EDIT",
  SCRAPE_IMPORT: "SCRAPE_IMPORT",
  REFUND: "REFUND",
  ADJUSTMENT: "ADJUSTMENT",
} as const;
export type CreditLedgerReason = (typeof CreditLedgerReason)[keyof typeof CreditLedgerReason];

// Credit packs available for purchase (credits granted -> env price id key).
export const CREDIT_PACKS = [
  { id: "starter", label: "Starter", credits: 100, priceEnv: "STRIPE_CREDIT_PACK_100_PRICE_ID", priceUsd: 10 },
  { id: "growth", label: "Growth", credits: 300, priceEnv: "STRIPE_CREDIT_PACK_300_PRICE_ID", priceUsd: 25 },
  { id: "pro", label: "Pro", credits: 1000, priceEnv: "STRIPE_CREDIT_PACK_1000_PRICE_ID", priceUsd: 75 },
] as const;
export type CreditPackId = (typeof CREDIT_PACKS)[number]["id"];
