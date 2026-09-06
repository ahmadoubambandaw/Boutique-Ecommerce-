"use server";

import { newsletterSchema } from "@/lib/validations";
import { addSubscriber } from "@/lib/commerce/newsletter";
import { captureError } from "@/lib/monitoring";

export type NewsletterState = { ok?: boolean; error?: string };

/**
 * Store a newsletter sign-up.
 *
 * This used to create a Shopify customer, and returned success without saving
 * anything whenever Shopify was not configured — which, since the store moved
 * off Shopify, meant every address was silently thrown away behind a "Merci !
 * Vous êtes inscrit·e" message. Sign-ups now go to our own table and the
 * confirmation is only shown when the write actually happened.
 */
export async function subscribeNewsletterAction(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Adresse e-mail invalide." };
  }

  try {
    const stored = await addSubscriber(parsed.data.email);
    if (!stored) {
      return { error: "Inscription momentanément indisponible. Réessayez." };
    }
    return { ok: true };
  } catch (err) {
    captureError(err, { stage: "newsletter-subscribe" });
    return { error: "Inscription momentanément indisponible. Réessayez." };
  }
}
