import "server-only";
import crypto from "node:crypto";
import { createTenant, attachStripeCustomer } from "./repository";
import { featuresForPlan } from "./plans";
import {
  createStorefrontToken,
  getShopInfo,
  registerWebhooks,
} from "@/lib/shopify/oauth";
import { getStripe } from "@/lib/stripe/client";
import type { SubscriptionPlan, Tenant } from "./types";

/** Derive a URL-safe slug from a shop name / domain. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/\.myshopify\.com$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

/**
 * Provision a brand-new tenant after a successful Shopify OAuth install:
 *  1. read shop metadata,
 *  2. mint a public Storefront token,
 *  3. register webhooks,
 *  4. create a Stripe customer,
 *  5. persist the tenant row.
 *
 * Returns null when no DB is configured (nothing to persist).
 */
export async function provisionTenant(opts: {
  shop: string;
  adminToken: string;
  plan?: SubscriptionPlan;
}): Promise<Tenant | null> {
  const { shop, adminToken, plan = "basic" } = opts;

  const info = await getShopInfo(shop, adminToken);
  const storefrontToken = await createStorefrontToken(shop, adminToken);
  if (!storefrontToken) return null;

  await registerWebhooks(shop, adminToken);

  const storeName = info?.name ?? slugify(shop);
  const slug = slugify(storeName || shop);

  // Create the Stripe customer up-front so billing can attach later.
  let stripeCustomerId: string | null = null;
  const stripe = getStripe();
  if (stripe && info?.email) {
    const customer = await stripe.customers
      .create({ email: info.email, name: storeName, metadata: { shop } })
      .catch(() => null);
    stripeCustomerId = customer?.id ?? null;
  }

  const id = crypto.randomUUID();
  const tenant = await createTenant({
    id,
    slug,
    customDomain: null,
    status: "trialing",
    plan,
    shopifyStoreDomain: shop,
    shopifyStorefrontToken: storefrontToken,
    shopifyAdminToken: adminToken,
    shopifyApiVersion: process.env.SHOPIFY_ADMIN_API_VERSION ?? "2025-01",
    branding: {
      logoUrl: null,
      faviconUrl: null,
      storeName,
      tagline: null,
    },
    theme: {
      primary: "240 6% 10%",
      accent: "240 6% 10%",
      radius: "soft",
      fontFamily: "geist",
      defaultMode: "system",
    },
    seo: { metaTitle: storeName, metaDescription: null, ogImageUrl: null },
    integrations: {
      metaPixelId: null,
      googleAnalyticsId: null,
      googleTagManagerId: null,
    },
    banners: [],
    stripeCustomerId,
    stripeSubscriptionId: null,
    currentPeriodEnd: null,
  });

  if (tenant && stripeCustomerId) {
    await attachStripeCustomer(tenant.id, stripeCustomerId);
  }

  // Ensure features reflect the plan even before the row round-trips.
  return tenant ? { ...tenant, features: featuresForPlan(plan) } : null;
}
