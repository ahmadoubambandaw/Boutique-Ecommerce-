/**
 * Tenant model — the heart of the multi-tenant SaaS.
 *
 * Each customer (merchant) connects their own Shopify store and gets a fully
 * isolated storefront: own domain, theme, colours, fonts, SEO, integrations.
 * The catalog is NEVER copied here — only the tenant's configuration and the
 * credentials needed to talk to *their* Shopify store live in the registry.
 */

export type SubscriptionPlan = "basic" | "pro" | "enterprise";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "suspended";

export type TenantTheme = {
  /** Primary brand colour (HSL triplet, e.g. "240 6% 10%"). */
  primary: string;
  /** Accent colour used for CTAs and highlights. */
  accent: string;
  /** Base radius scale. */
  radius: "sharp" | "soft" | "round";
  /** Font family key from the supported font set. */
  fontFamily: "geist" | "inter" | "playfair" | "satoshi";
  /** Default colour scheme. */
  defaultMode: "light" | "dark" | "system";
};

export type TenantBranding = {
  logoUrl: string | null;
  faviconUrl: string | null;
  storeName: string;
  tagline: string | null;
};

export type TenantSeo = {
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
};

export type TenantIntegrations = {
  metaPixelId: string | null;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
};

export type TenantShopify = {
  /** The tenant's *.myshopify.com domain. */
  storeDomain: string;
  /** Public Storefront API token (safe for edge/browser use). */
  storefrontAccessToken: string;
  /** Admin API token — SERVER ONLY, never sent to the client. */
  adminAccessToken: string | null;
  apiVersion: string;
};

export type TenantBanner = {
  id: string;
  message: string;
  href: string | null;
  active: boolean;
};

export type Tenant = {
  id: string;
  /** URL-safe slug used for the *.boutique.app subdomain. */
  slug: string;
  /** Optional verified custom domain. */
  customDomain: string | null;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  createdAt: string;

  shopify: TenantShopify;
  branding: TenantBranding;
  theme: TenantTheme;
  seo: TenantSeo;
  integrations: TenantIntegrations;
  banners: TenantBanner[];

  /** Feature flags derived from the plan (multi-currency, PWA, etc.). */
  features: {
    multiCurrency: boolean;
    multiLanguage: boolean;
    liveChat: boolean;
    customDomain: boolean;
    prioritySupport: boolean;
  };
};
