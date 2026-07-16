import { describe, it, expect, beforeAll } from "vitest";
import { mapStripeStatus, planForPriceId, priceIdForPlan } from "@/lib/stripe/billing";

beforeAll(() => {
  process.env.STRIPE_PRICE_BASIC = "price_basic_123";
  process.env.STRIPE_PRICE_PRO = "price_pro_456";
  process.env.STRIPE_PRICE_ENTERPRISE = "price_ent_789";
});

describe("mapStripeStatus", () => {
  it("maps active states", () => {
    expect(mapStripeStatus("trialing")).toBe("trialing");
    expect(mapStripeStatus("active")).toBe("active");
  });
  it("maps failing states to past_due", () => {
    expect(mapStripeStatus("past_due")).toBe("past_due");
    expect(mapStripeStatus("unpaid")).toBe("past_due");
  });
  it("maps terminal states to canceled", () => {
    expect(mapStripeStatus("canceled")).toBe("canceled");
    expect(mapStripeStatus("incomplete_expired")).toBe("canceled");
  });
  it("falls back to suspended for unknown states", () => {
    expect(mapStripeStatus("paused")).toBe("suspended");
  });
});

describe("price mapping", () => {
  it("resolves a price id per plan", () => {
    expect(priceIdForPlan("pro")).toBe("price_pro_456");
  });
  it("reverse-maps a price id back to a plan", () => {
    expect(planForPriceId("price_ent_789")).toBe("enterprise");
    expect(planForPriceId("price_unknown")).toBeNull();
  });
});
