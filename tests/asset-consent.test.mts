import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { importedAssetDigest, recordAssetConsent, resolveConsentedAssets } = await import(
  "../lib/branding/asset-consent"
);
const { ASSET_CONSENT_STATEMENT, needsImportedAssetConsent, parseAssetConsent } = await import(
  "../lib/branding/imported-brand"
);

const projectId = "proj";
const sourceUrl = "https://www.iana.org/help/example-domains";
const logo = `/uploads/${projectId}/imported/logo.png`;
const photo = `/uploads/${projectId}/imported/photo.jpg`;

function brand() {
  return {
    sourceUrl,
    importedAt: "2026-10-19T00:00:00.000Z",
    logoUrl: logo,
    images: [
      {
        url: photo,
        altText: "Example domains",
        sourcePageUrl: sourceUrl,
        orientation: "landscape" as const,
      },
    ],
    notes: [] as string[],
  };
}

describe("imported asset consent", () => {
  it("keeps the single ownership sentence", () => {
    assert.equal(
      ASSET_CONSENT_STATEMENT,
      "I own or have the right to use the images and logo on this website."
    );
  });

  it("asks for confirmation only when a logo or image was imported", () => {
    const sample = brand();
    assert.equal(needsImportedAssetConsent(sample, null), true);
    assert.equal(needsImportedAssetConsent(sample, { granted: true }), false);
    assert.equal(needsImportedAssetConsent({ ...sample, logoUrl: undefined, images: [] }, null), false);
  });

  it("returns no files until the customer confirms them", () => {
    const resolved = resolveConsentedAssets({ brand: brand(), consent: null, projectId });
    assert.equal(resolved.granted, false);
    assert.equal(resolved.logoUrl, undefined);
    assert.deepEqual(resolved.images, []);
    assert.equal(recordAssetConsent({ granted: false, brand: brand(), previous: null }), undefined);
  });

  it("includes the logo and images together once confirmed", () => {
    const recorded = recordAssetConsent({
      granted: true,
      brand: brand(),
      previous: null,
      now: new Date("2026-10-19T12:00:00.000Z"),
    });
    assert.ok(recorded);
    assert.equal(recorded.statement, ASSET_CONSENT_STATEMENT);
    assert.equal(Object.hasOwn(recorded, "includedPaths"), false);
    const resolved = resolveConsentedAssets({ brand: brand(), consent: recorded, projectId });
    assert.equal(resolved.granted, true);
    assert.equal(resolved.logoUrl, logo);
    assert.equal(resolved.images[0]?.url, photo);
  });

  it("ignores an older per-file list and keeps every imported file", () => {
    const sample = brand();
    const recorded = recordAssetConsent({
      granted: true,
      brand: sample,
      previous: null,
      now: new Date("2026-10-19T12:00:00.000Z"),
    });
    assert.ok(recorded);
    const parsed = parseAssetConsent({ ...recorded, includedPaths: [logo] });
    assert.equal(parsed?.granted, true);
    assert.equal(parsed ? Object.hasOwn(parsed, "includedPaths") : false, false);
    const resolved = resolveConsentedAssets({
      brand: sample,
      consent: parsed,
      projectId,
    });
    assert.equal(resolved.logoUrl, logo);
    assert.equal(resolved.images.length, 1);
  });

  it("keeps the original confirmation time when the same import is saved again", () => {
    const sample = brand();
    const first = recordAssetConsent({
      granted: true,
      brand: sample,
      previous: null,
      now: new Date("2026-01-01T00:00:00.000Z"),
    });
    assert.ok(first);
    const again = recordAssetConsent({
      granted: true,
      brand: sample,
      previous: first,
      now: new Date("2026-10-19T12:00:00.000Z"),
    });
    assert.equal(again?.confirmedAt, first.confirmedAt);
    assert.equal(again?.statement, ASSET_CONSENT_STATEMENT);
    assert.equal(again?.assetDigest, importedAssetDigest(sample));
  });
});
