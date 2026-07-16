"use server";

import { revalidatePath } from "next/cache";
import { resolveTenant } from "./registry";
import { updateTenantConfig } from "./repository";
import { getAdminSession } from "@/lib/auth/admin-actions";
import { isDbConfigured } from "@/lib/db/client";
import { tenantSettingsSchema } from "@/lib/validations";

export type SettingsState = { ok?: boolean; error?: string };

function clean(value: FormDataEntryValue | null): string | null {
  const s = String(value ?? "").trim();
  return s === "" ? null : s;
}

/**
 * Persist a tenant's storefront customization (branding, theme, SEO, pixel,
 * banner). Requires an authenticated owner/super admin and a database.
 */
export async function updateTenantSettingsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  if (!isDbConfigured()) {
    return {
      error:
        "Mode démo : configurez une base de données pour enregistrer la personnalisation.",
    };
  }

  const session = await getAdminSession();
  if (!session || (session.role !== "owner" && session.role !== "super_admin")) {
    return { error: "Accès non autorisé." };
  }

  const parsed = tenantSettingsSchema.safeParse({
    storeName: formData.get("storeName"),
    tagline: formData.get("tagline"),
    logoUrl: formData.get("logoUrl"),
    faviconUrl: formData.get("faviconUrl"),
    accent: formData.get("accent"),
    primary: formData.get("primary"),
    radius: formData.get("radius"),
    fontFamily: formData.get("fontFamily"),
    defaultMode: formData.get("defaultMode"),
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription"),
    metaPixelId: formData.get("metaPixelId"),
    googleAnalyticsId: formData.get("googleAnalyticsId"),
    bannerMessage: formData.get("bannerMessage"),
    bannerHref: formData.get("bannerHref"),
    bannerActive: formData.get("bannerActive") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }

  const tenant = await resolveTenant();
  // Owners may only edit their own tenant.
  if (session.role === "owner" && session.tenantId && session.tenantId !== tenant.id) {
    return { error: "Vous ne pouvez modifier que votre propre boutique." };
  }

  const d = parsed.data;
  const bannerMessage = clean(formData.get("bannerMessage"));

  const updated = await updateTenantConfig(tenant.id, {
    branding: {
      storeName: d.storeName,
      tagline: clean(formData.get("tagline")),
      logoUrl: clean(formData.get("logoUrl")),
      faviconUrl: clean(formData.get("faviconUrl")),
    },
    theme: {
      ...tenant.theme,
      accent: d.accent,
      primary: d.primary,
      radius: d.radius,
      fontFamily: d.fontFamily,
      defaultMode: d.defaultMode,
    },
    seo: {
      ...tenant.seo,
      metaTitle: clean(formData.get("metaTitle")),
      metaDescription: clean(formData.get("metaDescription")),
    },
    integrations: {
      ...tenant.integrations,
      metaPixelId: clean(formData.get("metaPixelId")),
      googleAnalyticsId: clean(formData.get("googleAnalyticsId")),
    },
    banners: bannerMessage
      ? [
          {
            id: "primary",
            message: bannerMessage,
            href: clean(formData.get("bannerHref")),
            active: d.bannerActive ?? false,
          },
        ]
      : [],
  });

  if (!updated) return { error: "Échec de l'enregistrement." };

  // Reflect the new theme/branding immediately across the storefront + admin.
  revalidatePath("/", "layout");
  return { ok: true };
}
