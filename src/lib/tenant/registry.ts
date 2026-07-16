import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import type { Tenant } from "./types";
import { featuresForPlan } from "./plans";

/**
 * Tenant registry.
 *
 * In production this is backed by a database (the tenant metadata table —
 * NOT the catalog). For local development and the demo deployment we resolve a
 * single default tenant from environment variables so the storefront runs with
 * zero infrastructure.
 *
 * Swap `loadTenantFromStore` for a real DB query (Prisma/Drizzle/Supabase)
 * to go multi-tenant — the rest of the app is already tenant-aware.
 */

function defaultTenant(): Tenant {
  const plan = "pro" as const;
  return {
    id: "default",
    slug: "demo",
    customDomain: null,
    status: "active",
    plan,
    createdAt: new Date("2025-01-01").toISOString(),
    shopify: {
      storeDomain: process.env.SHOPIFY_STORE_DOMAIN ?? "",
      storefrontAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "",
      adminAccessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? null,
      apiVersion: process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-01",
    },
    branding: {
      logoUrl: null,
      faviconUrl: null,
      storeName: "Boutique",
      tagline: "L'e-commerce headless, réinventé.",
    },
    theme: {
      primary: "240 6% 10%",
      accent: "240 6% 10%",
      radius: "soft",
      fontFamily: "geist",
      defaultMode: "system",
    },
    seo: {
      metaTitle: "Boutique — Headless Commerce Premium",
      metaDescription:
        "Une expérience d'achat plus rapide, moderne et élégante que les thèmes Shopify classiques.",
      ogImageUrl: null,
    },
    integrations: {
      metaPixelId: null,
      googleAnalyticsId: null,
      googleTagManagerId: null,
    },
    banners: [
      {
        id: "welcome",
        message: "Livraison offerte dès 50€ — Nouvelle collection disponible",
        href: "/products",
        active: true,
      },
    ],
    features: featuresForPlan(plan),
  };
}

/**
 * Resolve the active tenant for the current request from its host header.
 * Supports both `slug.rootdomain` subdomains and verified custom domains.
 *
 * Cached per-request via React `cache()` so repeated calls in one render are free.
 */
export const resolveTenant = cache(async (): Promise<Tenant> => {
  const hdrs = await headers();
  const host =
    hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "";

  const tenant = await loadTenantFromStore(host);
  return tenant ?? defaultTenant();
});

/**
 * Look up a tenant by hostname. Replace the body with a real query:
 *   SELECT * FROM tenants WHERE custom_domain = $host OR slug = $subdomain
 */
async function loadTenantFromStore(_host: string): Promise<Tenant | null> {
  // TODO(multi-tenant): query the tenant registry DB here.
  // For now every host maps to the env-configured default tenant.
  return null;
}
