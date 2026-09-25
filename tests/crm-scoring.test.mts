import assert from "node:assert/strict";
import { describe, it } from "node:test";

// fulfillment.ts pulls in the Prisma client. Constructing it needs a URL, but
// nothing here runs a query, so a placeholder keeps the import side-effect free.
process.env.DATABASE_URL ??= "postgresql://user:pass@localhost:5432/test";

const { CREDIT_PACKS } = await import("../lib/constants");
const {
  PACKAGE_SCORES,
  ONE_TIME_SCORES,
  CrmScoreAction,
  packageScore,
  oneTimeScore,
  assertScoringConfigIsComplete,
} = await import("../lib/crm/config");
const { resolveCreditPack } = await import("../lib/stripe/stripe");
const { isSessionPaid } = await import("../lib/stripe/fulfillment");
const {
  clientsToCsv,
  creditPackFromCredits,
  parseClientListQuery,
  scoreActionLabel,
} = await import("../lib/crm/admin");

describe("credit packages", () => {
  it("offers exactly the three specified tiers", () => {
    assert.deepEqual(
      CREDIT_PACKS.map((p) => ({ id: p.id, credits: p.credits, priceUsd: p.priceUsd })),
      [
        { id: "small", credits: 20, priceUsd: 10 },
        { id: "medium", credits: 60, priceUsd: 29 },
        { id: "large", credits: 100, priceUsd: 45 },
      ]
    );
  });

  it("scores each tier as specified", () => {
    assert.equal(packageScore("small"), 10);
    assert.equal(packageScore("medium"), 20);
    assert.equal(packageScore("large"), 40);
  });

  it("scores an unknown package as zero rather than guessing", () => {
    assert.equal(packageScore("enterprise"), 0);
  });

  it("keeps every pack scored", () => {
    assert.doesNotThrow(assertScoringConfigIsComplete);
    assert.equal(Object.keys(PACKAGE_SCORES).length, CREDIT_PACKS.length);
  });
});

describe("one-time actions", () => {
  it("uses the specified point values", () => {
    assert.equal(oneTimeScore(CrmScoreAction.REGISTERED), 5);
    assert.equal(oneTimeScore(CrmScoreAction.THEME_SELECTED), 5);
    assert.equal(oneTimeScore(CrmScoreAction.QUESTIONNAIRE_COMPLETED), 20);
  });

  it("treats the manual questionnaire and the scraper as one event", () => {
    // There is deliberately no separate scraper action: both paths award
    // QUESTIONNAIRE_COMPLETED, so doing both is worth 20 points, not 40.
    assert.equal(Object.keys(ONE_TIME_SCORES).length, 3);
    assert.ok(!Object.keys(ONE_TIME_SCORES).some((k) => /SCRAP|IMPORT/i.test(k)));
  });
});

describe("resolveCreditPack", () => {
  it("resolves by pack id", () => {
    assert.equal(resolveCreditPack({ packId: "medium" })?.credits, 60);
  });

  it("ignores a credit count that contradicts the pack id", () => {
    // Metadata is not trusted for the grant amount; the pack definition wins.
    const pack = resolveCreditPack({ packId: "small", credits: "999999" });
    assert.equal(pack?.credits, 20);
  });

  it("falls back to the credit count for sessions created before packId existed", () => {
    assert.equal(resolveCreditPack({ credits: "100" })?.id, "large");
  });

  it("returns null when nothing identifies a real pack", () => {
    assert.equal(resolveCreditPack({ credits: "7" }), null);
    assert.equal(resolveCreditPack({}), null);
    assert.equal(resolveCreditPack(null), null);
  });
});

describe("isSessionPaid", () => {
  const session = (over: Record<string, unknown>) =>
    ({ payment_status: "unpaid", status: "open", ...over }) as never;

  it("accepts a paid session", () => {
    assert.equal(isSessionPaid(session({ payment_status: "paid" })), true);
  });

  it("accepts a zero-amount session", () => {
    assert.equal(isSessionPaid(session({ payment_status: "no_payment_required" })), true);
  });

  it("rejects a completed but unpaid delayed payment", () => {
    // The trap this guards: delayed notification methods complete the session
    // immediately and settle days later. Delivery must wait for the money.
    assert.equal(
      isSessionPaid(session({ status: "complete", payment_status: "unpaid" })),
      false
    );
  });
});

describe("admin client helpers", () => {
  it("resolves credit packs from the granted credit count", () => {
    assert.equal(creditPackFromCredits(60)?.id, "medium");
    assert.equal(creditPackFromCredits(7), null);
  });

  it("labels scoring actions for the admin ledger", () => {
    assert.equal(scoreActionLabel(CrmScoreAction.REGISTERED), "Logged in");
    assert.equal(scoreActionLabel(CrmScoreAction.QUESTIONNAIRE_COMPLETED), "Completed questionnaire");
  });

  it("parses list query defaults and filters", () => {
    const query = parseClientListQuery(
      new URLSearchParams("q=jane&sort=name&order=asc&consent=yes&page=2")
    );
    assert.equal(query.q, "jane");
    assert.equal(query.sort, "name");
    assert.equal(query.order, "asc");
    assert.equal(query.consent, "yes");
    assert.equal(query.page, 2);
  });

  it("escapes CSV cells", () => {
    const csv = clientsToCsv([
      {
        id: "u1",
        name: 'Jane "Founder"',
        email: "jane@example.com",
        createdAt: new Date("2026-01-02T03:04:05.000Z"),
        leadScore: 30,
        marketingConsent: true,
        marketingConsentAt: new Date("2026-01-02T03:04:05.000Z"),
        hubspotContactId: "c-1",
        hubspotLastSyncedAt: null,
        hubspotLastError: null,
      },
    ]);
    assert.match(csv, /"Jane ""Founder"""/);
    assert.match(csv, /jane@example.com/);
    assert.match(csv, /yes/);
  });
});
