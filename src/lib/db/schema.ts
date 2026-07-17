import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type {
  SubscriptionPlan,
  SubscriptionStatus,
  TenantBanner,
  TenantBranding,
  TenantIntegrations,
  TenantSeo,
  TenantTheme,
} from "@/lib/tenant/types";

/**
 * Tenant registry — stores ONLY each merchant's configuration and the
 * credentials needed to reach their Shopify store. The product catalogue is
 * never stored here: Shopify stays the single source of truth.
 */
export const tenants = pgTable(
  "tenants",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    customDomain: text("custom_domain"),
    status: text("status").$type<SubscriptionStatus>().notNull().default("trialing"),
    plan: text("plan").$type<SubscriptionPlan>().notNull().default("basic"),

    // Shopify credentials (admin token is server-only, never exposed).
    shopifyStoreDomain: text("shopify_store_domain").notNull(),
    shopifyStorefrontToken: text("shopify_storefront_token").notNull(),
    shopifyAdminToken: text("shopify_admin_token"),
    shopifyApiVersion: text("shopify_api_version").notNull().default("2026-01"),

    // Per-tenant configuration blobs.
    branding: jsonb("branding").$type<TenantBranding>().notNull(),
    theme: jsonb("theme").$type<TenantTheme>().notNull(),
    seo: jsonb("seo").$type<TenantSeo>().notNull(),
    integrations: jsonb("integrations").$type<TenantIntegrations>().notNull(),
    banners: jsonb("banners").$type<TenantBanner[]>().notNull().default([]),

    // Billing (Stripe).
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("tenants_slug_idx").on(t.slug),
    customDomainIdx: uniqueIndex("tenants_custom_domain_idx").on(t.customDomain),
    shopifyDomainIdx: index("tenants_shopify_domain_idx").on(t.shopifyStoreDomain),
    stripeCustomerIdx: index("tenants_stripe_customer_idx").on(t.stripeCustomerId),
  }),
);

/**
 * Admin / staff accounts. `tenantId = null` denotes a platform Super Admin.
 * Merchant staff are scoped to their tenant.
 */
export const adminUsers = pgTable(
  "admin_users",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").references(() => tenants.id, {
      onDelete: "cascade",
    }),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").$type<"super_admin" | "owner" | "staff">().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("admin_users_email_idx").on(t.email),
    tenantIdx: index("admin_users_tenant_idx").on(t.tenantId),
  }),
);

/**
 * Idempotency ledger for inbound webhooks (Shopify + Stripe). Prevents
 * double-processing when a provider retries delivery.
 */
export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: text("id").primaryKey(), // provider event id
    source: text("source").$type<"shopify" | "stripe">().notNull(),
    topic: text("topic").notNull(),
    tenantId: text("tenant_id"),
    processed: boolean("processed").notNull().default(false),
    payload: jsonb("payload"),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    sourceIdx: index("webhook_events_source_idx").on(t.source),
  }),
);

/** OAuth install state — short-lived CSRF tokens for the Shopify OAuth flow. */
export const oauthStates = pgTable("oauth_states", {
  state: text("state").primaryKey(),
  shop: text("shop").notNull(),
  plan: text("plan").$type<SubscriptionPlan>(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type TenantRow = typeof tenants.$inferSelect;
export type NewTenantRow = typeof tenants.$inferInsert;
export type AdminUserRow = typeof adminUsers.$inferSelect;
