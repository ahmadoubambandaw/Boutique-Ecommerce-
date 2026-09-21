"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { createQuoteRequest } from "@/lib/commerce/repository";
import { captureError } from "@/lib/monitoring";
import { notifyNewQuoteRequest } from "@/lib/notify";

const quoteSchema = z.object({
  companyName: z.string().min(1, "Nom de l'entreprise requis"),
  ninea: z.string().optional().or(z.literal("")),
  contactName: z.string().min(1, "Nom du contact requis"),
  phone: z.string().min(6, "Téléphone requis"),
  email: z.string().email("E-mail invalide").optional().or(z.literal("")),
  message: z.string().optional().or(z.literal("")),
});

export type SubmitQuoteState = {
  ok?: boolean;
  quoteId?: string;
  error?: string;
};

/**
 * Record a B2B quote request ("Demander un devis"). Large accounts procure by
 * purchase order/invoice, not cash-on-delivery checkout, so this is a
 * lightweight lead form rather than a cart checkout.
 */
export async function submitQuoteRequestAction(form: {
  companyName: string;
  ninea?: string;
  contactName: string;
  phone: string;
  email?: string;
  message?: string;
}): Promise<SubmitQuoteState> {
  const parsed = quoteSchema.safeParse(form);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }
  const d = parsed.data;

  try {
    const quote = await createQuoteRequest({
      id: crypto.randomUUID(),
      companyName: d.companyName,
      ninea: d.ninea || null,
      contactName: d.contactName,
      phone: d.phone,
      email: d.email || null,
      message: d.message || "",
    });

    if (!quote) {
      return {
        error:
          "Base de données non configurée. Impossible d'enregistrer la demande.",
      };
    }

    await notifyNewQuoteRequest(quote);

    return { ok: true, quoteId: quote.id };
  } catch (err) {
    captureError(err, { stage: "submit-quote-request" });
    return { error: "Une erreur est survenue. Réessayez." };
  }
}
