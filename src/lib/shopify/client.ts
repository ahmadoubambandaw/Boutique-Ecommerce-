import "server-only";
import { resolveTenant } from "@/lib/tenant/registry";
import type { TenantShopify } from "@/lib/tenant/types";

/**
 * Low-level Storefront API fetcher.
 *
 * Every request is scoped to the active tenant's Shopify credentials, so a
 * single deployment can serve thousands of independent stores. Shopify is the
 * single source of truth: we cache responses at the edge with Next's fetch
 * cache + tags (revalidated by webhooks) but never persist the catalog.
 */

export class ShopifyError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ShopifyError";
  }
}

type FetchOptions<V> = {
  query: string;
  variables?: V;
  /** Cache tags for on-demand revalidation via Shopify webhooks. */
  tags?: string[];
  /** Seconds; defaults to ISR-friendly 60s. Use 0 for cart mutations. */
  revalidate?: number;
  /** Override the tenant credentials (used by OAuth onboarding flows). */
  credentials?: TenantShopify;
};

export async function shopifyFetch<T, V = Record<string, unknown>>({
  query,
  variables,
  tags,
  revalidate = 60,
  credentials,
}: FetchOptions<V>): Promise<T> {
  const creds = credentials ?? (await resolveTenant()).shopify;

  if (!creds.storeDomain || !creds.storefrontAccessToken) {
    throw new ShopifyError(
      "Shopify credentials are not configured for this tenant.",
    );
  }

  const endpoint = `https://${creds.storeDomain}/api/${creds.apiVersion}/graphql.json`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": creds.storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
      cache: revalidate === 0 ? "no-store" : "force-cache",
      next: revalidate === 0 ? undefined : { revalidate, tags },
    });

    const json = await res.json();

    if (!res.ok) {
      throw new ShopifyError(
        `Storefront API responded ${res.status}`,
        res.status,
        json,
      );
    }

    if (json.errors) {
      throw new ShopifyError("GraphQL error", res.status, json.errors);
    }

    return json.data as T;
  } catch (err) {
    if (err instanceof ShopifyError) throw err;
    throw new ShopifyError(
      err instanceof Error ? err.message : "Unknown Storefront API error",
    );
  }
}
