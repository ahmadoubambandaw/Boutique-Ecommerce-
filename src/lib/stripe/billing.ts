import "server-only";
import { getStripe } from "./client";
import { PLANS } from "@/lib/tenant/plans";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/tenant/types";

/** Resolve a plan's Stripe Price id from its configured env var. */
export function priceIdForPlan(plan: SubscriptionPlan): string | null {
  return process.env[PLANS[plan].stripePriceEnv] ?? null;
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/**
 * Create a Stripe Checkout Session to start (or change) a subscription.
 * `tenantId` is stored in metadata so the webhook can link the subscription
 * back to the tenant record.
 */
export async function createSubscriptionCheckout(opts: {
  plan: SubscriptionPlan;
  tenantId: string;
  customerEmail?: string;
  stripeCustomerId?: string | null;
}): Promise<{ url: string } | { error: string }> {
  const stripe = getStripe();
  if (!stripe) return { error: "billing-not-configured" };

  const priceId = priceIdForPlan(opts.plan);
  if (!priceId) return { error: "price-not-configured" };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    ...(opts.stripeCustomerId
      ? { customer: opts.stripeCustomerId }
      : { customer_email: opts.customerEmail }),
    client_reference_id: opts.tenantId,
    subscription_data: {
      trial_period_days: 14,
      metadata: { tenantId: opts.tenantId, plan: opts.plan },
    },
    metadata: { tenantId: opts.tenantId, plan: opts.plan },
    allow_promotion_codes: true,
    success_url: `${appUrl()}/admin?checkout=success`,
    cancel_url: `${appUrl()}/pricing?checkout=cancelled`,
  });

  return session.url ? { url: session.url } : { error: "no-session-url" };
}

/** Create a Billing Portal session so a merchant can manage their subscription. */
export async function createBillingPortal(
  stripeCustomerId: string,
): Promise<{ url: string } | { error: string }> {
  const stripe = getStripe();
  if (!stripe) return { error: "billing-not-configured" };
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${appUrl()}/admin/settings`,
  });
  return { url: session.url };
}

/** Map a Stripe subscription status to our internal tenant status. */
export function mapStripeStatus(status: string): SubscriptionStatus {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return "suspended";
  }
}

/** Reverse-map a Stripe Price id back to a plan (for webhook processing). */
export function planForPriceId(priceId: string): SubscriptionPlan | null {
  for (const plan of Object.keys(PLANS) as SubscriptionPlan[]) {
    if (priceIdForPlan(plan) === priceId) return plan;
  }
  return null;
}
