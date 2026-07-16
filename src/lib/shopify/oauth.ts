import "server-only";
import crypto from "node:crypto";

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
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/shopify/callback`;
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
