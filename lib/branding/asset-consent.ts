import { createHash } from "node:crypto";
import {
  ASSET_CONSENT_STATEMENT,
  importedAssetPaths,
  sortedImportedAssetPaths,
  type ImportedAssetConsent,
  type ImportedBrand,
  type ImportedBrandImage,
} from "@/lib/branding/imported-brand";
import { mediaKeyFromUrl } from "@/lib/storage/s3";

// Licence consent for imported assets. A customer's colours and typeface are
// not copyrightable expression in the way their photographs and logo are, so
// only the files are gated here: the theme choice stays independent, and one
// confirmation covers every imported file.
//
// Server-only: the digest and the timestamp must not be computable-and-supplied
// by the caller they are meant to constrain.

/** The digest algorithm version, so an older record fails closed rather than open. */
const DIGEST_PREFIX = "v1";

/**
 * Binds a confirmation to one specific import. Recomputed from the brand that
 * is actually about to be used, so swapping in another site's files — or adding
 * a photo after the fact — invalidates the consent instead of inheriting it.
 */
export function importedAssetDigest(brand: ImportedBrand): string {
  const paths = sortedImportedAssetPaths(brand);
  const canonical = [DIGEST_PREFIX, brand.sourceUrl, ...paths].join("\n");
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

/** Imported files live in the project's own folder; anything else is not ours to serve. */
export function isProjectImportPath(url: string, projectId: string): boolean {
  if (url.startsWith(`/uploads/${projectId}/imported/`) && !url.includes("..")) {
    return true;
  }
  const key = mediaKeyFromUrl(url);
  return Boolean(key?.startsWith(`${projectId}/imported/`));
}

export type AssetConsentDenial =
  | "no-assets"
  | "not-confirmed"
  | "incomplete-record"
  | "source-mismatch"
  | "asset-mismatch"
  | "foreign-asset";

export type ResolvedAssets = {
  /** Empty unless a complete, matching confirmation covers this exact import. */
  logoUrl?: string;
  images: ImportedBrandImage[];
  granted: boolean;
  denial?: AssetConsentDenial;
};

/**
 * The single decision on whether a customer's own logo and photographs may be
 * republished. Fail-closed: every unexpected shape returns no assets, and the
 * caller is expected to use only what comes back rather than the raw brand.
 */
export function resolveConsentedAssets(params: {
  brand: ImportedBrand | null | undefined;
  consent: ImportedAssetConsent | null | undefined;
  /** Absent when the caller has no project context, which denies by definition. */
  projectId?: string;
}): ResolvedAssets {
  const { brand, consent, projectId } = params;
  const deny = (denial: AssetConsentDenial): ResolvedAssets => ({
    images: [],
    granted: false,
    denial,
  });

  if (!brand) return deny("no-assets");
  const paths = importedAssetPaths(brand);
  if (!paths.length) return deny("no-assets");

  if (!consent?.granted) return deny("not-confirmed");
  if (!consent.confirmedAt || !consent.sourceUrl || !consent.assetDigest || !consent.statement) {
    return deny("incomplete-record");
  }
  if (consent.sourceUrl !== brand.sourceUrl) return deny("source-mismatch");
  if (consent.assetDigest !== importedAssetDigest(brand)) return deny("asset-mismatch");
  if (!projectId || !paths.every((p) => isProjectImportPath(p, projectId))) {
    return deny("foreign-asset");
  }

  return { logoUrl: brand.logoUrl, images: brand.images, granted: true };
}

/**
 * Rebuilds the stored record from the customer's yes/no. An unchanged
 * confirmation keeps its original timestamp, so the record says when they first
 * agreed rather than when the questionnaire was last saved.
 */
export function recordAssetConsent(params: {
  granted: boolean;
  brand: ImportedBrand | null | undefined;
  previous: ImportedAssetConsent | null | undefined;
  now?: Date;
}): ImportedAssetConsent | undefined {
  const { granted, brand, previous, now } = params;
  if (!granted || !brand || importedAssetPaths(brand).length === 0) return undefined;

  const assetDigest = importedAssetDigest(brand);
  const unchanged = Boolean(
    previous?.granted &&
      previous.confirmedAt &&
      previous.assetDigest === assetDigest &&
      previous.sourceUrl === brand.sourceUrl
  );

  const confirmedAt =
    unchanged && previous?.confirmedAt ? previous.confirmedAt : (now ?? new Date()).toISOString();

  return {
    granted: true,
    confirmedAt,
    sourceUrl: brand.sourceUrl,
    statement: ASSET_CONSENT_STATEMENT,
    assetDigest,
  };
}
