import assert from "node:assert/strict";
import { describe, it } from "node:test";

const {
  ACCOUNT_INACTIVITY_DAYS,
  accountAgeCutoff,
  shouldDeactivateAccount,
} = await import("../lib/accounts/deactivation");

describe("account deactivation rule", () => {
  const now = new Date("2026-10-08T12:00:00.000Z");
  const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  it(`uses a ${ACCOUNT_INACTIVITY_DAYS}-day cutoff`, () => {
    const cutoff = accountAgeCutoff(now);
    assert.equal(
      Math.round((now.getTime() - cutoff.getTime()) / (24 * 60 * 60 * 1000)),
      ACCOUNT_INACTIVITY_DAYS
    );
  });

  it("deactivates stale accounts with no website or credit purchase", () => {
    assert.equal(
      shouldDeactivateAccount({
        createdAt: fifteenDaysAgo,
        hasWebsitePurchase: false,
        hasCreditPurchase: false,
        now,
      }),
      true
    );
  });

  it("keeps accounts younger than 14 days", () => {
    assert.equal(
      shouldDeactivateAccount({
        createdAt: fiveDaysAgo,
        hasWebsitePurchase: false,
        hasCreditPurchase: false,
        now,
      }),
      false
    );
  });

  it("never deactivates website buyers", () => {
    assert.equal(
      shouldDeactivateAccount({
        createdAt: fifteenDaysAgo,
        hasWebsitePurchase: true,
        hasCreditPurchase: false,
        now,
      }),
      false
    );
  });

  it("never deactivates credit pack buyers", () => {
    assert.equal(
      shouldDeactivateAccount({
        createdAt: fifteenDaysAgo,
        hasWebsitePurchase: false,
        hasCreditPurchase: true,
        now,
      }),
      false
    );
  });

  it("never deactivates admins or already-deactivated accounts", () => {
    assert.equal(
      shouldDeactivateAccount({
        createdAt: fifteenDaysAgo,
        isAdmin: true,
        hasWebsitePurchase: false,
        hasCreditPurchase: false,
        now,
      }),
      false
    );
    assert.equal(
      shouldDeactivateAccount({
        createdAt: fifteenDaysAgo,
        deactivatedAt: now,
        hasWebsitePurchase: false,
        hasCreditPurchase: false,
        now,
      }),
      false
    );
  });
});
