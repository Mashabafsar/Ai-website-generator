import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

// env.ts snapshots process.env when it loads, so configuration has to be in
// place before the modules under test are imported.
process.env.HUBSPOT_API_KEY = "pat-test-secret-key";
process.env.HUBSPOT_API_BASE_URL = "https://api.hubapi.example";
process.env.HUBSPOT_API_VERSION = "v3";
process.env.HUBSPOT_ASSOCIATIONS_API_VERSION = "v4";
process.env.HUBSPOT_REQUEST_TIMEOUT_MS = "200";
process.env.HUBSPOT_REQUEST_RETRIES = "2";

const { objectPath, associationPath, redact, hubspotRequest, HubSpotError, __testing } =
  await import("../lib/crm/hubspot-client");

type Call = { url: string; init: RequestInit };
type Responder = (init: RequestInit) => Promise<Response> | Response;

const realFetch = globalThis.fetch;
let calls: Call[] = [];

function stubFetch(responses: Responder[]) {
  let i = 0;
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    const next = responses[Math.min(i, responses.length - 1)];
    i += 1;
    return next(init ?? {});
  }) as typeof fetch;
}

/** A request that only ends when the client's own timeout aborts it. */
function hangUntilAborted(init: RequestInit): Promise<Response> {
  return new Promise((_resolve, reject) => {
    init.signal?.addEventListener("abort", () => {
      const err = new Error("aborted");
      err.name = "AbortError";
      reject(err);
    });
  });
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers });
}

describe("URL construction", () => {
  it("puts a legacy version before the resource group", () => {
    assert.equal(objectPath("contacts"), "/crm/v3/objects/contacts");
    assert.equal(objectPath("deals", "42"), "/crm/v3/objects/deals/42");
  });

  it("uses the associations version for association paths", () => {
    assert.equal(
      associationPath("deals", "1", "contacts", "2"),
      "/crm/v4/objects/deals/1/associations/contacts/2"
    );
  });

  it("recognizes date-based versions", () => {
    assert.equal(__testing.isLegacyVersion("v3"), true);
    assert.equal(__testing.isLegacyVersion("v4"), true);
    assert.equal(__testing.isLegacyVersion("2026-09"), false);
  });
});

describe("retry classification", () => {
  it("retries rate limits, migrations, and server errors only", () => {
    assert.equal(__testing.isRetryableStatus(429), true);
    assert.equal(__testing.isRetryableStatus(477), true);
    assert.equal(__testing.isRetryableStatus(503), true);
    assert.equal(__testing.isRetryableStatus(401), false);
    assert.equal(__testing.isRetryableStatus(400), false);
    assert.equal(__testing.isRetryableStatus(404), false);
  });

  it("reads Retry-After as seconds and caps absurd values", () => {
    assert.equal(__testing.parseRetryAfterMs("2"), 2000);
    assert.equal(__testing.parseRetryAfterMs("99999"), 60_000);
    assert.equal(__testing.parseRetryAfterMs(null), null);
    assert.equal(__testing.parseRetryAfterMs("not-a-number"), null);
  });
});

describe("redaction", () => {
  it("removes the API key and bearer tokens", () => {
    const leaked = redact("failed with pat-test-secret-key and Authorization: Bearer abc.def-123");
    assert.ok(!leaked.includes("pat-test-secret-key"));
    assert.ok(!leaked.includes("abc.def-123"));
    assert.ok(leaked.includes("[redacted]"));
  });
});

describe("hubspotRequest", () => {
  before(() => {
    calls = [];
  });

  after(() => {
    globalThis.fetch = realFetch;
  });

  it("sends the API key as a bearer token", async () => {
    calls = [];
    stubFetch([() => json({ id: "1" })]);
    await hubspotRequest("/crm/v3/objects/contacts", { method: "GET" });

    const headers = calls[0].init.headers as Record<string, string>;
    assert.equal(headers.Authorization, "Bearer pat-test-secret-key");
    assert.equal(headers["Content-Type"], "application/json");
    assert.equal(calls[0].url, "https://api.hubapi.example/crm/v3/objects/contacts");
  });

  it("retries a 429 and then succeeds", async () => {
    calls = [];
    stubFetch([
      () => json({ message: "rate limited" }, 429, { "retry-after": "0" }),
      () => json({ id: "99" }),
    ]);

    const result = await hubspotRequest<{ id: string }>("/crm/v3/objects/contacts", {
      method: "GET",
    });
    assert.equal(result.id, "99");
    assert.equal(calls.length, 2);
  });

  it("does not retry an authentication failure", async () => {
    calls = [];
    stubFetch([() => json({ message: "bad key" }, 401)]);

    await assert.rejects(
      () => hubspotRequest("/crm/v3/objects/contacts", { method: "GET" }),
      (err: unknown) => err instanceof HubSpotError && err.status === 401
    );
    assert.equal(calls.length, 1);
  });

  it("gives up after the retry budget and keeps the key out of the message", async () => {
    calls = [];
    stubFetch([() => json({ message: "boom pat-test-secret-key" }, 500)]);

    await assert.rejects(
      () => hubspotRequest("/crm/v3/objects/deals", { method: "GET" }),
      (err: unknown) => {
        assert.ok(err instanceof HubSpotError);
        assert.equal(err.status, 500);
        assert.ok(!err.message.includes("pat-test-secret-key"));
        return true;
      }
    );
    assert.equal(calls.length, 3, "1 initial attempt + 2 retries");
  });

  it("treats a timeout as retryable", async () => {
    calls = [];
    stubFetch([hangUntilAborted, () => json({ id: "ok" })]);

    const result = await hubspotRequest<{ id: string }>("/crm/v3/objects/contacts", {
      method: "GET",
    });
    assert.equal(result.id, "ok");
  });
});
