import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import type { Tenant } from "./types";
import { featuresForPlan } from "./plans";
import { findTenantByHost } from "./repository";
import { getSiteSettings } from "@/lib/commerce/settings";

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
      apiVersion: process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2026-01",
    },
    branding: {
      logoUrl: "/gse-logo.jpg",
      faviconUrl: "/gse-logo.jpg",
      storeName: "GSE",
      tagline: "Votre sécurité, notre engagement.",
    },
    theme: {
      primary: "214 81% 20%",
      accent: "214 81% 20%",
      radius: "soft",
      fontFamily: "geist",
      defaultMode: "light",
    },
    seo: {
      metaTitle: "GSE — Global Safety Équipement",
      metaDescription:
        "Équipements de protection individuelle (EPI) et solutions de sécurité incendie au Sénégal. Casques, chaussures, gants, extincteurs et plus. Livraison à Dakar, paiement à la livraison ou mobile money.",
      ogImageUrl: "/gse-logo.jpg",
    },
    integrations: {
      metaPixelId: null,
      googleAnalyticsId: null,
      googleTagManagerId: null,
    },
    banners: [
      {
        id: "welcome",
        message:
          "EPI & sécurité incendie — Livraison à Dakar · Paiement à la livraison ou mobile money",
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
  // `x-tenant-host` is set by the middleware (handles preview overrides);
  // fall back to the raw forwarded host when middleware didn't run.
  const host =
    hdrs.get("x-tenant-host") ??
    hdrs.get("x-forwarded-host") ??
    hdrs.get("host") ??
    "";

  const tenant = await loadTenantFromStore(host);
  if (tenant) return tenant;

  // Single-store mode: overlay the merchant's saved settings on the GSE default.
  const base = defaultTenant();
  const s = await getSiteSettings().catch(() => null);
  if (s) {
    base.theme = {
      ...base.theme,
      accent: s.accent ?? base.theme.accent,
      primary: s.primary ?? base.theme.primary,
    };
    base.branding = {
      ...base.branding,
      storeName: s.storeName ?? base.branding.storeName,
      tagline: s.tagline ?? base.branding.tagline,
    };
    if (s.bannerMessage) {
      base.banners = [
        { id: "primary", message: s.bannerMessage, href: "/products", active: s.bannerActive },
      ];
    } else if (!s.bannerActive) {
      base.banners = [];
    }
  }
  return base;
});

/**
 * Look up a tenant by hostname from the registry DB. Returns null when no DB is
 * configured (single-tenant / demo mode), in which case the env-based default
 * tenant is used instead.
 */
async function loadTenantFromStore(host: string): Promise<Tenant | null> {
  try {
    return await findTenantByHost(host);
  } catch {
    // A DB hiccup must never take the storefront down — fall back to default.
    return null;
  }
}
