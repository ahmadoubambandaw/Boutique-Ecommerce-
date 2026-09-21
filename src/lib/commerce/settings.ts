import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { siteSettings, type SiteSettingsRow } from "@/lib/db/schema";

export type SiteSettings = {
  accent: string | null;
  primary: string | null;
  storeName: string | null;
  tagline: string | null;
  bannerMessage: string | null;
  bannerActive: boolean;
  metaPixelId: string | null;
  googleAnalyticsId: string | null;
  invoicePhone: string | null;
  invoiceWhatsapp: string | null;
  invoiceEmail: string | null;
  invoiceAddress: string | null;
  bankAccountNumber: string | null;
  bankRib: string | null;
  bankCode: string | null;
};

const ID = "default";

function rowToSettings(r: SiteSettingsRow): SiteSettings {
  return {
    accent: r.accent,
    primary: r.primary,
    storeName: r.storeName,
    tagline: r.tagline,
    bannerMessage: r.bannerMessage,
    bannerActive: r.bannerActive,
    metaPixelId: r.metaPixelId,
    googleAnalyticsId: r.googleAnalyticsId,
    invoicePhone: r.invoicePhone,
    invoiceWhatsapp: r.invoiceWhatsapp,
    invoiceEmail: r.invoiceEmail,
    invoiceAddress: r.invoiceAddress,
    bankAccountNumber: r.bankAccountNumber,
    bankRib: r.bankRib,
    bankCode: r.bankCode,
  };
}

/** Read the store settings, or null when no DB / no row exists. */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, ID))
    .limit(1);
  return row ? rowToSettings(row) : null;
}

/** Upsert the store settings. */
export async function saveSiteSettings(
  input: Partial<SiteSettings>,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  const values = {
    id: ID,
    accent: input.accent ?? null,
    primary: input.primary ?? null,
    storeName: input.storeName ?? null,
    tagline: input.tagline ?? null,
    bannerMessage: input.bannerMessage ?? null,
    bannerActive: input.bannerActive ?? true,
    metaPixelId: input.metaPixelId ?? null,
    googleAnalyticsId: input.googleAnalyticsId ?? null,
    invoicePhone: input.invoicePhone ?? null,
    invoiceWhatsapp: input.invoiceWhatsapp ?? null,
    invoiceEmail: input.invoiceEmail ?? null,
    invoiceAddress: input.invoiceAddress ?? null,
    bankAccountNumber: input.bankAccountNumber ?? null,
    bankRib: input.bankRib ?? null,
    bankCode: input.bankCode ?? null,
    updatedAt: new Date(),
  };
  await db
    .insert(siteSettings)
    .values(values)
    .onConflictDoUpdate({ target: siteSettings.id, set: values });
}
