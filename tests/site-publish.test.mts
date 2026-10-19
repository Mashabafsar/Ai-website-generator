import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

const {
  cacheControlForPath,
  contentTypeForPath,
  releaseIdsToPrune,
  siteFileCandidates,
  subdomainFromHost,
} = await import("../lib/deployment/s3-sites");

const previousPlatform = process.env.PLATFORM_DOMAIN;

afterEach(() => {
  if (previousPlatform === undefined) delete process.env.PLATFORM_DOMAIN;
  else process.env.PLATFORM_DOMAIN = previousPlatform;
});

describe("site host names", () => {
  it("reads a single label under PLATFORM_DOMAIN", () => {
    process.env.PLATFORM_DOMAIN = "sites.example.com";
    assert.equal(subdomainFromHost("bright-smile.sites.example.com"), "bright-smile");
    assert.equal(subdomainFromHost("Bright-Smile.Sites.Example.com:443"), "bright-smile");
    assert.equal(subdomainFromHost("bright-smile.sites.example.com."), "bright-smile");
  });

  it("rejects the apex, other domains, and extra labels", () => {
    process.env.PLATFORM_DOMAIN = "sites.example.com";
    assert.equal(subdomainFromHost("sites.example.com"), null);
    assert.equal(subdomainFromHost("evil.example.com"), null);
    assert.equal(subdomainFromHost("a.b.sites.example.com"), null);
    assert.equal(subdomainFromHost("-bad.sites.example.com"), null);
    assert.equal(subdomainFromHost(null), null);
  });

  it("rejects every host when PLATFORM_DOMAIN is unset", () => {
    delete process.env.PLATFORM_DOMAIN;
    assert.equal(subdomainFromHost("bright-smile.sites.example.com"), null);
  });
});

describe("published file lookup", () => {
  it("resolves the homepage and clean URLs before the raw path", () => {
    assert.deepEqual(siteFileCandidates(undefined), ["index.html"]);
    assert.deepEqual(siteFileCandidates([]), ["index.html"]);
    assert.deepEqual(siteFileCandidates(["about"]), ["about.html", "about/index.html", "about"]);
    assert.deepEqual(siteFileCandidates(["about", "team"]), [
      "about/team.html",
      "about/team/index.html",
      "about/team",
    ]);
  });

  it("fetches an asset or an explicit html file directly", () => {
    assert.deepEqual(siteFileCandidates(["assets", "logo.png"]), ["assets/logo.png"]);
    assert.deepEqual(siteFileCandidates(["about", "index.html"]), ["about/index.html"]);
  });

  it("rejects path traversal", () => {
    assert.equal(siteFileCandidates([".."]), null);
    assert.equal(siteFileCandidates(["about", "..", "secret"]), null);
    assert.equal(siteFileCandidates(["%2e%2e"]), null);
  });
});

describe("release cleanup", () => {
  it("keeps the live release and the one before it", () => {
    assert.deepEqual(releaseIdsToPrune(["r1", "r2", "r3"], "r3"), ["r1"]);
    assert.deepEqual(releaseIdsToPrune(["r1"], "r1"), []);
    assert.deepEqual(releaseIdsToPrune(["r1", "r2"], "r2"), []);
  });

  it("does not delete a newer release that is still uploading", () => {
    assert.deepEqual(releaseIdsToPrune(["r0", "r1", "r2", "r3"], "r2"), ["r0"]);
  });
});

describe("published file headers", () => {
  it("uses a short cache for html and a long cache for assets", () => {
    assert.equal(cacheControlForPath("index.html"), "public, max-age=60");
    assert.equal(cacheControlForPath("about/index.html"), "public, max-age=60");
    assert.equal(cacheControlForPath("templates/logo.png"), "public, max-age=86400");
    assert.equal(cacheControlForPath("app.a1b2c3d4.js"), "public, max-age=31536000, immutable");
  });

  it("picks a content type from the extension", () => {
    assert.equal(contentTypeForPath("index.html"), "text/html; charset=utf-8");
    assert.equal(contentTypeForPath("assets/logo.png"), "image/png");
    assert.equal(contentTypeForPath("file.unknown"), "application/octet-stream");
  });
});
