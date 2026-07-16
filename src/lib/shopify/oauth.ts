import "server-only";
import crypto from "node:crypto";
import { appUrl } from "@/lib/urls";

/**
 * Shopify OAuth helpers for multi-tenant onboarding.
 *
 * Flow:
 *  1. Merchant enters their myshopify domain → we redirect to `buildAuthUrl`.
 *  2. Shopify redirects back to the callback with a `code` + HMAC.
 *  3. We verify the HMAC (`verifyHmac`) and exchange the code for an offline
 *     access token, then persist it against a new tenant record.
 *
 * This isolates each merchant's credentials — the core of the SaaS model.
 */

export function buildAuthUrl(shop: string, state: string) {
  const apiKey = process.env.SHOPIFY_API_KEY ?? "";
  const scopes = process.env.SHOPIFY_APP_SCOPES ?? "read_products";
  const redirectUri = `${appUrl()}/api/auth/shopify/callback`;
  const params = new URLSearchParams({
    client_id: apiKey,
    scope: scopes,
    redirect_uri: redirectUri,
    state,
    "grant_options[]": "",
  });
  return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
}

/** Verify the HMAC signature Shopify appends to OAuth callbacks. */
export function verifyHmac(query: Record<string, string>): boolean {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret) return false;
  const { hmac, ...rest } = query;
  if (!hmac) return false;
  const message = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("&");
  const digest = crypto.createHmac("sha256", secret).update(message).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(digest));
  } catch {
    return false;
  }
}

/** Exchange an OAuth `code` for a permanent offline access token. */
export async function exchangeCodeForToken(
  shop: string,
  code: string,
): Promise<string | null> {
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}

/** Basic shop-domain validation to avoid open redirects. */
export function isValidShopDomain(shop: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop);
}

const ADMIN_VERSION = process.env.SHOPIFY_ADMIN_API_VERSION ?? "2025-01";

export type ShopInfo = {
  name: string;
  email: string | null;
  currencyCode: string;
  primaryDomain: string;
};

/** Fetch basic shop metadata (name, currency) to seed the tenant record. */
export async function getShopInfo(
  shop: string,
  adminToken: string,
): Promise<ShopInfo | null> {
  const res = await fetch(`https://${shop}/admin/api/${ADMIN_VERSION}/shop.json`, {
    headers: { "X-Shopify-Access-Token": adminToken },
  });
  if (!res.ok) return null;
  const { shop: s } = (await res.json()) as {
    shop: {
      name: string;
      email?: string;
      currency: string;
      domain: string;
    };
  };
  return {
    name: s.name,
    email: s.email ?? null,
    currencyCode: s.currency,
    primaryDomain: s.domain,
  };
}

/**
 * Provision a Storefront API access token for the shop so the headless
 * storefront can read the catalogue with a public token.
 */
export async function createStorefrontToken(
  shop: string,
  adminToken: string,
): Promise<string | null> {
  const res = await fetch(
    `https://${shop}/admin/api/${ADMIN_VERSION}/storefront_access_tokens.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": adminToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        storefront_access_token: { title: "Boutique Headless Storefront" },
      }),
    },
  );
  if (!res.ok) return null;
  const json = (await res.json()) as {
    storefront_access_token?: { access_token: string };
  };
  return json.storefront_access_token?.access_token ?? null;
}

/** Register the webhooks that keep the storefront in sync with Shopify. */
export async function registerWebhooks(
  shop: string,
  adminToken: string,
): Promise<void> {
  const address = `${appUrl()}/api/revalidate`;
  const topics = [
    "products/update",
    "products/delete",
    "collections/update",
    "inventory_levels/update",
    "app/uninstalled",
  ];
  await Promise.all(
    topics.map((topic) =>
      fetch(`https://${shop}/admin/api/${ADMIN_VERSION}/webhooks.json`, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": adminToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          webhook: { topic, address, format: "json" },
        }),
      }).catch(() => {}),
    ),
  );
}
