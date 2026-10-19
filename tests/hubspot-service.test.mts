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
  associateDealWithCompany,
  associateDealWithLead,
  associateContactWithCompany,
  associateNoteWithContact,
  associateNoteWithDeal,
  upsertPurchaseDeal,
  upsertCompany,
  upsertContactNote,
  upsertDealNote,
  formatDealName,
  formatPriceBreakdown,
  formatProjectDetails,
  formatDealScore,
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
    assert.equal(props.hs_analytics_source, "DIRECT_TRAFFIC");
    assert.ok(!("lead_score" in props));
    assert.ok(!("marketing_consent" in props));
  });

  it("marks a new login as a HubSpot lead", async () => {
    calls = [];
    stubHubSpot([(c) => (c.method === "GET" ? json({ id: "c-1" }) : undefined)]);

    await upsertContact({ ...contact, lifecycleStage: "lead" });

    const props = (calls[1].body as { properties: Record<string, string> }).properties;
    assert.equal(props.lifecyclestage, "lead");
    assert.equal(props.hs_analytics_source, "DIRECT_TRAFFIC");
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
    dealName: formatDealName("Bright Smile Dental", 557),
    amount: 557,
    currency: "USD",
    websiteUrl: "https://bright-smile.sites.example.com",
    lineItems: [
      { name: "Website creation", amount: 499 },
      { name: "Monthly hosting", amount: 29 },
      { name: "Medium credit pack (60 credits)", amount: 29 },
    ],
    monthlyTotal: 29,
    packageLabel: "Managed hosting",
    closedWon: true,
    dealStage: "1450553354",
    score: {
      combined: 60,
      engagement: 45,
      fit: 15,
      label: "A1",
    },
    projectDetails: {
      businessName: "Bright Smile Dental",
      industry: "Dental Clinic",
      description: "Family dentist offering cleaning and whitening",
      location: "Austin, TX",
      targetAudience: "Families and professionals",
      services: ["Dental Cleaning", "Teeth Whitening"],
      tone: "Modern and trustworthy",
      contactEmail: "hello@brightsmile.example",
      contactPhone: "+1 512 555 0100",
    },
  };

  it("names the deal Company $Amount with no thousands separator", () => {
    assert.equal(formatDealName("Frontier Logistics", 7659), "Frontier Logistics $7659");
    assert.equal(formatDealName("Bright Smile Dental", 557.4), "Bright Smile Dental $557");
  });

  it("itemizes the breakdown and the charged total", () => {
    const text = formatPriceBreakdown(deal);
    assert.match(text, /Website creation: 499 USD/);
    assert.match(text, /Medium credit pack \(60 credits\): 29 USD/);
    assert.match(text, /Total paid: 557 USD/);
    assert.match(text, /Recurring: 29 USD\/month/);
  });

  it("shows unpaid quote and credit packs on an open deal", () => {
    const open = {
      ...deal,
      amount: 29,
      closedWon: false,
      quotedWebsiteTotal: 528,
      lineItems: [{ name: "Medium credit pack (60 credits)", amount: 29 }],
      monthlyTotal: 0,
    };
    const text = formatPriceBreakdown(open);
    assert.match(text, /Quoted website package \(unpaid\): 528 USD/);
    assert.match(text, /Medium credit pack \(60 credits\): 29 USD/);
    assert.match(text, /Total paid: 29 USD/);
  });

  it("includes HubSpot-style combined deal score in the description", () => {
    const text = formatDealScore(deal);
    assert.match(text, /Deal score: 60 \(A1\)/);
    assert.match(text, /Fit: 15 \/ Engagement: 45/);
    const { description } = splitDealDescription(deal);
    assert.match(description, /Deal score: 60 \(A1\)/);
  });

  it("includes questionnaire answers in the project details block", () => {
    const text = formatProjectDetails(deal);
    assert.match(text, /Business: Bright Smile Dental/);
    assert.match(text, /Industry: Dental Clinic/);
    assert.match(text, /Services: Dental Cleaning, Teeth Whitening/);
    assert.match(text, /Package: Managed hosting/);
    assert.match(text, /Contact email: hello@brightsmile.example/);
  });

  it("puts the website URL, project details, and breakdown on the description", () => {
    const { description, overflowBody } = splitDealDescription(deal);
    assert.match(description, /Website: https:\/\/bright-smile.sites.example.com/);
    assert.match(description, /Business: Bright Smile Dental/);
    assert.match(description, /Website creation: 499 USD/);
    assert.match(description, /Total paid: 557 USD/);
    assert.equal(overflowBody, null);
  });

  it("overflows a long description onto a note body", () => {
    const { description, overflowBody } = splitDealDescription(deal, 40);
    assert.match(description, /Full project details and itemized breakdown attached as a note/);
    assert.match(description, /Deal score: 60 \(A1\)/);
    assert.match(description, /Amount paid: 557 USD/);
    assert.ok(overflowBody && overflowBody.includes("Website creation: 499 USD"));
    assert.ok(overflowBody.includes("Business: Bright Smile Dental"));
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
    assert.equal(props.dealname, "Bright Smile Dental $557");
    assert.equal(props.amount, "557");
    assert.equal(props.pipeline, "941017774");
    assert.equal(props.dealstage, "1450553354");
    assert.match(props.description, /Website: https:\/\/bright-smile.sites.example.com/);
    assert.match(props.description, /Business: Bright Smile Dental/);
    assert.ok(props.closedate);
    assert.ok(!("website_builder_payment_id" in props));
    assert.ok(!("website_url" in props));
  });

  it("refreshes amount and credit lines on an already Closed Won deal", async () => {
    calls = [];
    stubHubSpot([]);

    const paidAt = new Date("2026-10-01T12:00:00.000Z");
    const afterCredits = {
      ...deal,
      amount: 586,
      dealName: formatDealName("Bright Smile Dental", 586),
      closeDate: paidAt,
      lineItems: [
        { name: "Website creation", amount: 499 },
        { name: "Monthly hosting", amount: 29 },
        { name: "Medium credit pack (60 credits)", amount: 29 },
        { name: "Small credit pack (20 credits)", amount: 10 },
      ],
    };

    const id = await upsertPurchaseDeal(afterCredits, "d-closed");
    assert.equal(id, "d-closed");

    const props = (calls[0].body as { properties: Record<string, string> }).properties;
    assert.equal(props.dealstage, "1450553354");
    assert.equal(props.amount, "586");
    assert.equal(props.dealname, "Bright Smile Dental $586");
    assert.equal(props.closedate, paidAt.toISOString());
    assert.match(props.description, /Deal score: 60 \(A1\)/);
    assert.match(props.description, /Website creation: 499 USD/);
    assert.match(props.description, /Medium credit pack \(60 credits\): 29 USD/);
    assert.match(props.description, /Small credit pack \(20 credits\): 10 USD/);
    assert.match(props.description, /Total paid: 586 USD/);
  });

  it("keeps an unpaid deal on Preview Generated without a close date", async () => {
    calls = [];
    stubHubSpot([(c) => (c.method === "POST" ? json({ id: "d-open" }) : undefined)]);

    const open = {
      ...deal,
      amount: 0,
      closedWon: false,
      dealStage: "1450553349",
      lineItems: [],
      quotedWebsiteTotal: 528,
      dealName: formatDealName("Bright Smile Dental", 0),
    };
    assert.equal(await upsertPurchaseDeal(open), "d-open");
    const props = (calls[0].body as { properties: Record<string, string> }).properties;
    assert.equal(props.pipeline, "941017774");
    assert.equal(props.dealstage, "1450553349");
    assert.equal(props.amount, "0");
    assert.ok(!("closedate" in props));
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

    const noteId = await upsertDealNote({ dealId: "d-1", body: "Website: …\nTotal charged: 557 USD" });

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

  it("creates a company from the business name", async () => {
    calls = [];
    stubHubSpot([
      (c) =>
        c.method === "POST" && c.url.includes("/companies/search")
          ? json({ results: [] })
          : undefined,
      (c) => (c.method === "POST" && c.url.endsWith("/companies") ? json({ id: "co-1" }) : undefined),
    ]);

    const id = await upsertCompany({ name: "Frontier Logistics", domain: "frontierlogistics.com" });

    assert.equal(id, "co-1");
    const create = calls.find((c) => c.method === "POST" && c.url.endsWith("/companies"))!;
    const props = (create.body as { properties: Record<string, string> }).properties;
    assert.equal(props.name, "Frontier Logistics");
    assert.equal(props.domain, "frontierlogistics.com");
  });

  it("does not store a hosted subdomain or localhost as the company domain", async () => {
    const previous = process.env.PLATFORM_DOMAIN;
    process.env.PLATFORM_DOMAIN = "sites.example.com";
    try {
      calls = [];
      stubHubSpot([
        (c) =>
          c.method === "POST" && c.url.includes("/companies/search")
            ? json({ results: [] })
            : undefined,
        (c) => (c.method === "POST" && c.url.endsWith("/companies") ? json({ id: "co-hosted" }) : undefined),
      ]);

      await upsertCompany({ name: "Bright Smile", domain: "bright-smile.sites.example.com" });
      const hosted = calls.find((c) => c.method === "POST" && c.url.endsWith("/companies"))!;
      const hostedProps = (hosted.body as { properties: Record<string, string> }).properties;
      assert.equal(hostedProps.name, "Bright Smile");
      assert.equal("domain" in hostedProps, false);

      calls = [];
      await upsertCompany({ name: "Local Shop", domain: "localhost" });
      const local = calls.find((c) => c.method === "POST" && c.url.endsWith("/companies"))!;
      const localProps = (local.body as { properties: Record<string, string> }).properties;
      assert.equal("domain" in localProps, false);

      calls = [];
      await upsertCompany({ name: "Frontier Logistics", domain: "frontierlogistics.com" });
      const real = calls.find((c) => c.method === "POST" && c.url.endsWith("/companies"))!;
      const realProps = (real.body as { properties: Record<string, string> }).properties;
      assert.equal(realProps.domain, "frontierlogistics.com");
    } finally {
      if (previous === undefined) delete process.env.PLATFORM_DOMAIN;
      else process.env.PLATFORM_DOMAIN = previous;
    }
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

  it("links the deal to the Closed Won lead", async () => {
    calls = [];
    stubHubSpot([() => json({})]);

    await associateDealWithLead("d-1", "l-1");

    assert.equal(calls[0].method, "PUT");
    assert.equal(
      calls[0].url,
      "https://api.hubapi.example/crm/objects/2026-09/deals/d-1/associations/leads/l-1"
    );
    assert.deepEqual(calls[0].body, [
      { associationCategory: "HUBSPOT_DEFINED", associationTypeId: 583 },
    ]);
  });

  it("links the deal to the company", async () => {
    calls = [];
    stubHubSpot([() => json({})]);

    await associateDealWithCompany("d-1", "co-1");

    assert.equal(
      calls[0].url,
      "https://api.hubapi.example/crm/objects/2026-09/deals/d-1/associations/companies/co-1"
    );
    assert.deepEqual(calls[0].body, [
      { associationCategory: "HUBSPOT_DEFINED", associationTypeId: 5 },
    ]);
  });

  it("links the contact to the company", async () => {
    calls = [];
    stubHubSpot([() => json({})]);

    await associateContactWithCompany("c-1", "co-1");

    assert.equal(
      calls[0].url,
      "https://api.hubapi.example/crm/objects/2026-09/contacts/c-1/associations/companies/co-1"
    );
    assert.deepEqual(calls[0].body, [
      { associationCategory: "HUBSPOT_DEFINED", associationTypeId: 1 },
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
    assert.equal(body.properties.hs_lead_name, "Jane Doe (Bright Smile)");
    assert.equal(body.properties.lead_score, "5");
    assert.equal(body.properties.hs_lead_label, "COLD");
    assert.equal(body.properties.hs_lead_type, "NEW_BUSINESS");
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
