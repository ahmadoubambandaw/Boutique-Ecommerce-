import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
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
import type {
  NativeImage,
  NativeOption,
  NativeVariant,
  OrderAddress,
  OrderItem,
  OrderStatus,
  PaymentMethod,
} from "@/lib/commerce/types";

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

/* ─────────────────────────────────────────────────────────────
   Native commerce — our OWN catalogue & orders (no Shopify).
   ───────────────────────────────────────────────────────────── */

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull().default("default"),
    handle: text("handle").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    compareAtPrice: numeric("compare_at_price", { precision: 12, scale: 2 }),
    currency: text("currency").notNull().default("XOF"),
    vendor: text("vendor").notNull().default(""),
    productType: text("product_type").notNull().default(""),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    images: jsonb("images").$type<NativeImage[]>().notNull().default([]),
    options: jsonb("options").$type<NativeOption[]>().notNull().default([]),
    variants: jsonb("variants").$type<NativeVariant[]>().notNull().default([]),
    available: boolean("available").notNull().default(true),
    featured: boolean("featured").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    handleIdx: uniqueIndex("products_tenant_handle_idx").on(t.tenantId, t.handle),
    typeIdx: index("products_type_idx").on(t.productType),
  }),
);

export const collections = pgTable(
  "collections",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull().default("default"),
    handle: text("handle").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    image: jsonb("image").$type<NativeImage | null>(),
    productTypeRule: text("product_type_rule"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    handleIdx: uniqueIndex("collections_tenant_handle_idx").on(t.tenantId, t.handle),
  }),
);

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull().default("default"),
    orderNumber: serial("order_number").notNull(),
    items: jsonb("items").$type<OrderItem[]>().notNull(),
    address: jsonb("address").$type<OrderAddress>().notNull(),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    deliveryFee: numeric("delivery_fee", { precision: 12, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("XOF"),
    paymentMethod: text("payment_method").$type<PaymentMethod>().notNull(),
    status: text("status").$type<OrderStatus>().notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    tenantIdx: index("orders_tenant_idx").on(t.tenantId),
    createdIdx: index("orders_created_idx").on(t.createdAt),
  }),
);

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
export type CollectionRow = typeof collections.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
