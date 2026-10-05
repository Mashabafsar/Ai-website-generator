import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { industryAwareCta, industryAwareContactHeading } = await import(
  "../templates/rebo/cta"
);

describe("rebo industry-aware CTAs", () => {
  it("rewrites agency consultation CTAs for a bakery", () => {
    assert.equal(
      industryAwareCta("Book a free consultant", "Bakery"),
      "Contact us for your order"
    );
    assert.equal(
      industryAwareContactHeading("Let's start a project together", "Pastry cafe"),
      "Contact us for your order"
    );
  });

  it("keeps consultation language for agencies and clinics", () => {
    assert.equal(
      industryAwareCta("Book a free consultant", "Design agency"),
      "Book a free consultant"
    );
    assert.equal(
      industryAwareCta("Book a consultation", "Dental clinic"),
      "Book a consultation"
    );
  });

  it("leaves non-agency CTAs alone", () => {
    assert.equal(industryAwareCta("Order today", "Bakery"), "Order today");
    assert.equal(industryAwareCta("Get in touch", "Plumbing"), "Get in touch");
  });
});
