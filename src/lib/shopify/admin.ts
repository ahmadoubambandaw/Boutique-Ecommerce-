import "server-only";
import { resolveTenant } from "@/lib/tenant/registry";
import { ShopifyError } from "./client";

/**
 * Shopify Admin GraphQL API client (server-only).
 *
 * Used for merchant-facing reads the Storefront API can't provide (order
 * analytics, revenue, fulfillment lookups) and for writing orders from the
 * local-payment checkout (lib/shopify/orders.ts). Scoped to the active
 * tenant's offline admin token. We never mutate the CATALOGUE — products stay
 * managed in Shopify, the single source of truth.
 */

type AdminCreds = { storeDomain: string; adminToken: string; apiVersion: string };

async function resolveAdminCreds(
  override?: AdminCreds,
): Promise<AdminCreds | null> {
  if (override) return override;
  const t = await resolveTenant();
  if (!t.shopify.storeDomain || !t.shopify.adminAccessToken) return null;
  return {
    storeDomain: t.shopify.storeDomain,
    adminToken: t.shopify.adminAccessToken,
    apiVersion: process.env.SHOPIFY_ADMIN_API_VERSION ?? t.shopify.apiVersion,
  };
}

/** Whether the active tenant has Admin API access configured. */
export async function hasAdminApi(): Promise<boolean> {
  return (await resolveAdminCreds()) !== null;
}

export async function adminFetch<T>(opts: {
  query: string;
  variables?: Record<string, unknown>;
  credentials?: AdminCreds;
}): Promise<T> {
  const creds = await resolveAdminCreds(opts.credentials);
  if (!creds) {
    throw new ShopifyError("Admin API credentials are not configured.");
  }

  const endpoint = `https://${creds.storeDomain}/admin/api/${creds.apiVersion}/graphql.json`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": creds.adminToken,
    },
    body: JSON.stringify({ query: opts.query, variables: opts.variables }),
    // Admin data must never be statically cached — always fresh, per request.
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok) {
    throw new ShopifyError(`Admin API responded ${res.status}`, res.status, json);
  }
  if (json.errors) {
    throw new ShopifyError("Admin GraphQL error", res.status, json.errors);
  }
  return json.data as T;
}
