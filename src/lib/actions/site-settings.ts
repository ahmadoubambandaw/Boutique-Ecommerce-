"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/admin-actions";
import { isDbConfigured } from "@/lib/db/client";
import { saveSiteSettings } from "@/lib/commerce/settings";

export type BrandSettingsState = { ok?: boolean; error?: string };

/** HSL triple like "214 81% 20%" (Tailwind hsl(var(--x)) format). */
const HSL_RE = /^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%$/;

function clean(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

/** Persist the merchant's appearance settings (accent, name, tagline, banner). */
export async function saveBrandSettingsAction(
  _prev: BrandSettingsState,
  formData: FormData,
): Promise<BrandSettingsState> {
  if (!isDbConfigured()) {
    return { error: "Base de données non configurée." };
  }
  const session = await getAdminSession();
  if (!session) return { error: "Session expirée. Reconnectez-vous." };

  const accent = clean(formData.get("accent"));
  const primary = clean(formData.get("primary")) ?? accent;
  if (accent && !HSL_RE.test(accent)) {
    return { error: "Couleur d'accent invalide (format attendu : 214 81% 20%)." };
  }

  try {
    await saveSiteSettings({
      accent,
      primary,
      storeName: clean(formData.get("storeName")),
      tagline: clean(formData.get("tagline")),
      bannerMessage: clean(formData.get("bannerMessage")),
      bannerActive: formData.get("bannerActive") === "on",
      metaPixelId: clean(formData.get("metaPixelId")),
      googleAnalyticsId: clean(formData.get("googleAnalyticsId")),
      invoicePhone: clean(formData.get("invoicePhone")),
      invoiceWhatsapp: clean(formData.get("invoiceWhatsapp")),
      invoiceEmail: clean(formData.get("invoiceEmail")),
      invoiceAddress: clean(formData.get("invoiceAddress")),
      bankAccountNumber: clean(formData.get("bankAccountNumber")),
      bankRib: clean(formData.get("bankRib")),
      bankCode: clean(formData.get("bankCode")),
    });
    // Reflect the new colours/name/banner across storefront + admin immediately.
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return { error: "Échec de l'enregistrement. Réessayez." };
  }
}
