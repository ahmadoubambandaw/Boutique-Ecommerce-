import { describe, it, expect } from "vitest";
import { PLANS, PLAN_LIST, featuresForPlan } from "@/lib/tenant/plans";

describe("plans", () => {
  it("exposes three plans in ascending price order", () => {
    expect(PLAN_LIST.map((p) => p.id)).toEqual(["basic", "pro", "enterprise"]);
    expect(PLANS.basic.priceMonthly).toBeLessThan(PLANS.pro.priceMonthly);
    expect(PLANS.pro.priceMonthly).toBeLessThan(PLANS.enterprise.priceMonthly);
  });

  it("derives features from the plan", () => {
    expect(featuresForPlan("basic").customDomain).toBe(false);
    expect(featuresForPlan("pro").customDomain).toBe(true);
    expect(featuresForPlan("pro").multiLanguage).toBe(false);
    expect(featuresForPlan("enterprise").multiLanguage).toBe(true);
    expect(featuresForPlan("enterprise").prioritySupport).toBe(true);
  });

  it("maps each plan to a Stripe price env var", () => {
    expect(PLANS.basic.stripePriceEnv).toBe("STRIPE_PRICE_BASIC");
    expect(PLANS.enterprise.stripePriceEnv).toBe("STRIPE_PRICE_ENTERPRISE");
  });
});
