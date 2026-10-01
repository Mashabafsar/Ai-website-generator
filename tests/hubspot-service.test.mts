import assert from "node:assert/strict";
import { after, describe, it } from "node:test";

process.env.HUBSPOT_API_KEY = "pat-service-key";
process.env.HUBSPOT_API_BASE_URL = "https://api.hubapi.example";
process.env.HUBSPOT_API_VERSION = "2026-09";
process.env.HUBSPOT_ASSOCIATIONS_API_VERSION = "2026-09";
process.env.HUBSPOT_REQUEST_RETRIES = "0";

const {
  upsertContact,
  associateDealWithContact,
  associateNoteWithContact,
  associateNoteWithDeal,
  upsertPurchaseDeal,
  upsertContactNote,
  upsertDealNote,
  formatPriceBreakdown,
  formatProgressNote,
  splitDealDescription,
  upsertLead,
} = await import("../lib/crm/hubspot");
const { leadLabel } = await import("../lib/crm/config");

type Call = { method: string; url: string; body: unknown };

const realFetch = globalThis.fetch;
let calls: Call[] = [];

/** Route by method + path so tests describe HubSpot, not a response sequence. */
function stubHubSpot(routes: ((call: Call) => Response | undefined)[]) {
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    const call: Call = {
      method: (init?.method ?? "GET").toUpperCase(),
      url: String(url),
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    };
    calls.push(call);
    for (const route of routes) {
      const res = route(call);
      if (res) return res;
    }
    return new Response("{}", { status: 200 });
  }) as typeof fetch;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

const contact = {
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
  company: "Bright Smile",
};

after(() => {
  globalThis.fetch = realFetch;
});

describe("contact upsert", () => {
  it("uses date-based object paths when configured that way", async () => {
    calls = [];
    stubHubSpot([(c) => (c.method === "GET" ? json({ id: "c-1" }) : undefined)]);

    await upsertContact(contact);

    assert.ok(
      calls[0].url.includes("/crm/objects/2026-09/contacts/"),
      `unexpected lookup path: ${calls[0].url}`
    );
  });

  it("updates the existing contact rather than creating a duplicate", async () => {
    calls = [];
    stubHubSpot([(c) => (c.method === "GET" ? json({ id: "c-1" }) : undefined)]);

    const id = await upsertContact(contact);

    assert.equal(id, "c-1");
    assert.deepEqual(
      calls.map((c) => c.method),
      ["GET", "PATCH"]
    );
    const props = (calls[1].body as { properties: Record<string, string> }).properties;
    assert.equal(props.email, "jane@example.com");
    assert.equal(props.firstname, "Jane");
    assert.equal(props.lastname, "Doe");
    assert.equal(props.company, "Bright Smile");
    assert.ok(!("lead_score" in props));
    assert.ok(!("marketing_consent" in props));
  });

  it("marks a new login as a HubSpot lead", async () => {
    calls = [];
    stubHubSpot([(c) => (c.method === "GET" ? json({ id: "c-1" }) : undefined)]);

    await upsertContact({ ...contact, lifecycleStage: "lead" });

    const props = (calls[1].body as { properties: Record<string, string> }).properties;
    assert.equal(props.lifecyclestage, "lead");
  });

  it("creates the contact when the email is unknown", async () => {
    calls = [];
    stubHubSpot([
      (c) => (c.method === "GET" ? json({ message: "not found" }, 404) : undefined),
      (c) => (c.method === "POST" ? json({ id: "c-new" }) : undefined),
    ]);

    const id = await upsertContact(contact);

    assert.equal(id, "c-new");
    assert.deepEqual(
      calls.map((c) => c.method),
      ["GET", "POST"]
    );
  });

  it("recovers when a concurrent writer created the contact first", async () => {
    calls = [];
    let lookups = 0;
    stubHubSpot([
      (c) => {
        if (c.method !== "GET") return undefined;
        lookups += 1;
        return lookups === 1 ? json({ message: "not found" }, 404) : json({ id: "c-race" });
      },
      (c) => (c.method === "POST" ? json({ message: "conflict" }, 409) : undefined),
    ]);

    const id = await upsertContact(contact);

    assert.equal(id, "c-race", "should adopt the contact the other writer created");
    assert.deepEqual(
      calls.map((c) => c.method),
      ["GET", "POST", "GET", "PATCH"]
    );
  });

  it("falls back to email lookup when the cached contact id is gone", async () => {
    calls = [];
    stubHubSpot([
      (c) => (c.method === "PATCH" && c.url.endsWith("/stale") ? json({}, 404) : undefined),
      (c) => (c.method === "GET" ? json({ id: "c-real" }) : undefined),
    ]);

    const id = await upsertContact(contact, "stale");

    assert.equal(id, "c-real");
  });
});

describe("purchase deal", () => {
  const deal = {
    paymentId: "pay_123",
    projectId: "proj_1",
    dealName: "Bright Smile — website",
    amount: 528,
    currency: "USD",
    websiteUrl: "https://bright-smile.vercel.app",
    lineItems: [
      { name: "Website creation", amount: 499 },
      { name: "Monthly hosting", amount: 29 },
    ],
    monthlyTotal: 29,
  };

  it("itemizes the breakdown and the charged total", () => {
    const text = formatPriceBreakdown(deal);
    assert.match(text, /Website creation: 499 USD/);
    assert.match(text, /Total charged: 528 USD/);
    assert.match(text, /Recurring: 29 USD\/month/);
  });

  it("puts the website URL and breakdown on the standard description", () => {
    const { description, overflowBody } = splitDealDescription(deal);
    assert.match(description, /Website: https:\/\/bright-smile.vercel.app/);
    assert.match(description, /Website creation: 499 USD/);
    assert.equal(overflowBody, null);
  });

  it("overflows a long breakdown onto a note body", () => {
    const { description, overflowBody } = splitDealDescription(deal, 40);
    assert.match(description, /Full itemized breakdown attached as a note/);
    assert.ok(overflowBody && overflowBody.includes("Website creation: 499 USD"));
  });

  it("updates the existing deal from the cached id without a property search", async () => {
    calls = [];
    stubHubSpot([]);

    const id = await upsertPurchaseDeal(deal, "d-1");

    assert.equal(id, "d-1");
    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, "PATCH");
    assert.ok(!calls[0].url.includes("/search"));
    const props = (calls[0].body as { properties: Record<string, string> }).properties;
    assert.equal(props.dealname, deal.dealName);
    assert.equal(props.amount, "528");
    assert.match(props.description, /Website: https:\/\/bright-smile.vercel.app/);
    assert.ok(!("website_builder_payment_id" in props));
    assert.ok(!("website_url" in props));
  });

  it("creates a deal when the payment has none", async () => {
    calls = [];
    stubHubSpot([(c) => (c.method === "POST" ? json({ id: "d-new" }) : undefined)]);

    assert.equal(await upsertPurchaseDeal(deal), "d-new");
    assert.equal(calls[0].method, "POST");
    assert.ok(calls[0].url.includes("/crm/objects/2026-09/deals"));
  });

  it("creates a note and associates it with the deal", async () => {
    calls = [];
    stubHubSpot([(c) => (c.method === "POST" ? json({ id: "n-1" }) : undefined)]);

    const noteId = await upsertDealNote({ dealId: "d-1", body: "Website: …\nTotal charged: 528 USD" });

    assert.equal(noteId, "n-1");
    assert.equal(calls[0].method, "POST");
    assert.ok(calls[0].url.includes("/crm/objects/2026-09/notes"));
    const props = (calls[0].body as { properties: Record<string, string> }).properties;
    assert.ok(props.hs_note_body);
    assert.ok(props.hs_timestamp);
    assert.equal(calls[1].method, "PUT");
    assert.equal(
      calls[1].url,
      "https://api.hubapi.example/crm/objects/2026-09/notes/n-1/associations/deals/d-1"
    );
  });

  it("updates a cached note instead of creating another", async () => {
    calls = [];
    stubHubSpot([]);

    const noteId = await upsertDealNote({
      dealId: "d-1",
      body: "updated",
      knownNoteId: "n-existing",
    });

    assert.equal(noteId, "n-existing");
    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, "PATCH");
  });
});

describe("association", () => {
  it("links the deal to the contact through the associations API version", async () => {
    calls = [];
    stubHubSpot([() => json({})]);

    await associateDealWithContact("d-1", "c-1");

    assert.equal(calls[0].method, "PUT");
    assert.equal(
      calls[0].url,
      "https://api.hubapi.example/crm/objects/2026-09/deals/d-1/associations/contacts/c-1"
    );
    assert.deepEqual(calls[0].body, [
      { associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 },
    ]);
  });

  it("links a note to the deal", async () => {
    calls = [];
    stubHubSpot([() => json({})]);

    await associateNoteWithDeal("n-1", "d-1");

    assert.deepEqual(calls[0].body, [
      { associationCategory: "HUBSPOT_DEFINED", associationTypeId: 214 },
    ]);
  });

  it("links a progress note to the contact", async () => {
    calls = [];
    stubHubSpot([() => json({})]);

    await associateNoteWithContact("n-1", "c-1");

    assert.equal(
      calls[0].url,
      "https://api.hubapi.example/crm/objects/2026-09/notes/n-1/associations/contacts/c-1"
    );
    assert.deepEqual(calls[0].body, [
      { associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 },
    ]);
  });
});

describe("progress notes", () => {
  it("writes the action, points, and running total", () => {
    const body = formatProgressNote({
      action: "REGISTERED",
      points: 5,
      total: 5,
    });
    assert.match(body, /Logged in/);
    assert.match(body, /\+5 points/);
    assert.match(body, /Lead score: 5/);
  });

  it("creates a contact note and associates it", async () => {
    calls = [];
    stubHubSpot([(c) => (c.method === "POST" ? json({ id: "n-login" }) : undefined)]);

    const noteId = await upsertContactNote({
      contactId: "c-1",
      body: "Logged in\n+5 points\nLead score: 5",
      timestamp: new Date("2026-01-02T03:04:05.000Z"),
    });

    assert.equal(noteId, "n-login");
    const props = (calls[0].body as { properties: Record<string, string> }).properties;
    assert.equal(props.hs_note_body, "Logged in\n+5 points\nLead score: 5");
    assert.equal(props.hs_timestamp, "2026-01-02T03:04:05.000Z");
    assert.equal(calls[1].method, "PUT");
    assert.ok(calls[1].url.includes("/notes/n-login/associations/contacts/c-1"));
  });
});

describe("lead record", () => {
  const lead = { contactId: "c-1", displayName: "Jane Doe (Bright Smile)", score: 5, closedWon: false };

  it("labels by score: login cold, questionnaire warm, credits hot", () => {
    assert.equal(leadLabel(5), "COLD");
    assert.equal(leadLabel(20), "WARM");
    assert.equal(leadLabel(30), "HOT");
  });

  it("creates a New lead tied to the contact as its primary contact", async () => {
    calls = [];
    stubHubSpot([
      (c) => (c.method === "GET" && c.url.includes("/associations/leads") ? json({ results: [] }) : undefined),
      (c) =>
        c.method === "GET" && c.url.includes("/pipelines/") && c.url.endsWith("/leads")
          ? json({
              results: [
                {
                  id: "pipe-lead",
                  label: "Lead pipeline",
                  displayOrder: 0,
                  stages: [{ id: "stage-new", label: "New", displayOrder: 0 }],
                },
              ],
            })
          : undefined,
      (c) => (c.method === "POST" && c.url.endsWith("/leads") ? json({ id: "l-1" }) : undefined),
    ]);

    const id = await upsertLead(lead);

    assert.equal(id, "l-1");
    const create = calls.find((c) => c.method === "POST")!;
    const body = create.body as {
      properties: Record<string, string>;
      associations: { to: { id: string }; types: { associationTypeId: number }[] }[];
    };
    assert.equal(body.properties.hs_lead_name, "Jane Doe (Bright Smile) — Lead score 5");
    assert.equal(body.properties.hs_lead_label, "COLD");
    assert.equal(body.properties.hs_lead_type, "NEW BUSINESS");
    assert.equal(body.properties.hs_pipeline, "pipe-lead");
    assert.equal(body.properties.hs_pipeline_stage, "stage-new");
    assert.equal(body.associations[0].to.id, "c-1");
    assert.equal(body.associations[0].types[0].associationTypeId, 578);
  });

  it("assigns the configured owner so the lead shows under My leads", async () => {
    process.env.HUBSPOT_LEAD_OWNER_ID = "owner-99";
    try {
      calls = [];
      stubHubSpot([
        (c) =>
          c.method === "GET" && c.url.includes("/associations/leads")
            ? json({ results: [] })
            : undefined,
        (c) => (c.method === "POST" && c.url.endsWith("/leads") ? json({ id: "l-2" }) : undefined),
      ]);

      const id = await upsertLead(lead);
      assert.equal(id, "l-2");
      const create = calls.find((c) => c.method === "POST")!;
      const props = (create.body as { properties: Record<string, string> }).properties;
      assert.equal(props.hubspot_owner_id, "owner-99");
    } finally {
      delete process.env.HUBSPOT_LEAD_OWNER_ID;
    }
  });

  it("reuses a lead already on the contact and leaves its stage alone", async () => {
    calls = [];
    stubHubSpot([
      (c) =>
        c.method === "GET" && c.url.includes("/associations/leads")
          ? json({ results: [{ toObjectId: 77 }] })
          : undefined,
    ]);

    const id = await upsertLead({ ...lead, score: 20 });

    assert.equal(id, "77");
    assert.ok(!calls.some((c) => c.method === "POST"));
    const patch = calls.find((c) => c.method === "PATCH")!;
    const props = (patch.body as { properties: Record<string, string> }).properties;
    assert.equal(props.hs_lead_label, "WARM");
    assert.equal(props.hs_pipeline_stage, undefined);
  });

  it("moves a paid lead to the pipeline's Closed Won stage", async () => {
    calls = [];
    stubHubSpot([
      (c) =>
        c.method === "GET" && c.url.includes("/pipelines/") && c.url.endsWith("/leads")
          ? json({
              results: [
                {
                  id: "pipe-lead",
                  label: "Lead pipeline",
                  stages: [{ id: "stage-new", label: "New", displayOrder: 0 }],
                },
              ],
            })
          : undefined,
      (c) =>
        c.method === "GET" && c.url.includes("/pipelines/") && c.url.includes("/pipe-lead")
          ? json({
              stages: [
                { id: "stage-new", label: "New", displayOrder: 1 },
                { id: "stage-cw", label: "Closed Won", displayOrder: 6 },
              ],
            })
          : undefined,
    ]);

    await upsertLead({ ...lead, score: 30, closedWon: true }, "l-1");

    assert.ok(!calls.some((c) => c.method === "POST"), "existing stage must not be recreated");
    const patch = calls.find((c) => c.method === "PATCH")!;
    assert.ok(patch.url.includes("/leads/l-1"));
    const props = (patch.body as { properties: Record<string, string> }).properties;
    assert.equal(props.hs_pipeline, "pipe-lead");
    assert.equal(props.hs_pipeline_stage, "stage-cw");
    assert.equal(props.hs_lead_label, "HOT");
  });
});
