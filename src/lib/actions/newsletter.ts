"use server";

import { adminFetch, hasAdminApi } from "@/lib/shopify/admin";
import { newsletterSchema } from "@/lib/validations";
import { captureError, captureMessage } from "@/lib/monitoring";

export type NewsletterState = { ok?: boolean; error?: string };

const subscribeMutation = /* GraphQL */ `
  mutation subscribe($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Subscribe an email to marketing. When the tenant has Admin API access we
 * create/opt-in a Shopify customer with email marketing consent; otherwise we
 * record the intent (wire your ESP — Klaviyo/Mailchimp — here).
 */
export async function subscribeNewsletterAction(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Adresse e-mail invalide." };
  }
  const email = parsed.data.email;

  if (!(await hasAdminApi())) {
    captureMessage("newsletter subscribe (demo)", { email });
    return { ok: true };
  }

  try {
    const data = await adminFetch<{
      customerCreate: {
        customer: { id: string } | null;
        userErrors: { field: string[] | null; message: string }[];
      };
    }>({
      query: subscribeMutation,
      variables: {
        input: {
          email,
          emailMarketingConsent: {
            marketingState: "SUBSCRIBED",
            marketingOptInLevel: "SINGLE_OPT_IN",
          },
        },
      },
    });

    const errors = data.customerCreate.userErrors;
    // "already been taken" means the email is already a customer — still a success.
    if (errors.length > 0 && !errors[0]!.message.toLowerCase().includes("taken")) {
      return { error: errors[0]!.message };
    }
    return { ok: true };
  } catch (err) {
    captureError(err, { stage: "newsletter-subscribe" });
    return { error: "Inscription momentanément indisponible. Réessayez." };
  }
}
