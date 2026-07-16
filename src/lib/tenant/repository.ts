import "server-only";
import { and, eq, or } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { tenants, type NewTenantRow, type TenantRow } from "@/lib/db/schema";
import { featuresForPlan } from "./plans";
import type { SubscriptionPlan, SubscriptionStatus, Tenant } from "./types";

/**
 * Data-access layer for tenants. All tenant reads/writes go through here so the
 * rest of the app never touches the DB directly. When no database is configured
 * every method degrades to `null`/no-op and the registry falls back to the
 * env-configured demo tenant.
 */

/** Map a DB row to the rich domain `Tenant` (features derived from the plan). */
export function rowToTenant(row: TenantRow): Tenant {
  return {
    id: row.id,
    slug: row.slug,
    customDomain: row.customDomain,
    status: row.status,
    plan: row.plan,
    createdAt: row.createdAt.toISOString(),
    shopify: {
      storeDomain: row.shopifyStoreDomain,
      storefrontAccessToken: row.shopifyStorefrontToken,
      adminAccessToken: row.shopifyAdminToken,
      apiVersion: row.shopifyApiVersion,
    },
    branding: row.branding,
    theme: row.theme,
    seo: row.seo,
    integrations: row.integrations,
    banners: row.banners,
    features: featuresForPlan(row.plan),
  };
}

/** Resolve a tenant from an incoming request host (custom domain or slug). */
export async function findTenantByHost(host: string): Promise<Tenant | null> {
  const db = getDb();
  if (!db || !host) return null;

  const cleanHost = host.split(":")[0]!.toLowerCase();
  const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "").split(":")[0];
  const slug =
    root && cleanHost.endsWith(`.${root}`)
      ? cleanHost.slice(0, -(root.length + 1))
      : null;

  const [row] = await db
    .select()
    .from(tenants)
    .where(
      slug
        ? or(eq(tenants.customDomain, cleanHost), eq(tenants.slug, slug))
        : eq(tenants.customDomain, cleanHost),
    )
    .limit(1);

  return row ? rowToTenant(row) : null;
}

export async function findTenantBySlug(slug: string): Promise<Tenant | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
  return row ? rowToTenant(row) : null;
}

export async function findTenantByShopDomain(
  shopDomain: string,
): Promise<Tenant | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.shopifyStoreDomain, shopDomain))
    .limit(1);
  return row ? rowToTenant(row) : null;
}

export async function findTenantByStripeCustomer(
  stripeCustomerId: string,
): Promise<Tenant | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.stripeCustomerId, stripeCustomerId))
    .limit(1);
  return row ? rowToTenant(row) : null;
}

export async function createTenant(input: NewTenantRow): Promise<Tenant | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .insert(tenants)
    .values(input)
    .onConflictDoUpdate({
      target: tenants.shopifyStoreDomain,
      set: {
        shopifyStorefrontToken: input.shopifyStorefrontToken,
        shopifyAdminToken: input.shopifyAdminToken,
        updatedAt: new Date(),
      },
    })
    .returning();
  return row ? rowToTenant(row) : null;
}

export async function updateSubscription(
  stripeCustomerId: string,
  data: {
    plan?: SubscriptionPlan;
    status?: SubscriptionStatus;
    stripeSubscriptionId?: string | null;
    currentPeriodEnd?: Date | null;
  },
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .update(tenants)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(tenants.stripeCustomerId, stripeCustomerId));
}

export async function setTenantStatus(
  tenantId: string,
  status: SubscriptionStatus,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .update(tenants)
    .set({ status, updatedAt: new Date() })
    .where(eq(tenants.id, tenantId));
}

export async function deleteTenant(tenantId: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.delete(tenants).where(eq(tenants.id, tenantId));
}

export async function listTenants(): Promise<Tenant[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db.select().from(tenants);
  return rows.map(rowToTenant);
}

/** Update a tenant's presentation config (branding, theme, SEO, integrations). */
export async function updateTenantConfig(
  tenantId: string,
  patch: Partial<
    Pick<TenantRow, "branding" | "theme" | "seo" | "integrations" | "banners" | "customDomain">
  >,
): Promise<Tenant | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .update(tenants)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(tenants.id, tenantId))
    .returning();
  return row ? rowToTenant(row) : null;
}

export async function attachStripeCustomer(
  tenantId: string,
  stripeCustomerId: string,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .update(tenants)
    .set({ stripeCustomerId, updatedAt: new Date() })
    .where(and(eq(tenants.id, tenantId)));
}
