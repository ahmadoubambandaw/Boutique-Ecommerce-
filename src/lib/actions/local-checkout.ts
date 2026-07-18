"use server";

import crypto from "node:crypto";
import { shopifyFetch } from "@/lib/shopify/client";
import { getPaymentProvider } from "@/lib/payments";
import type { CheckoutCustomer, CheckoutLine } from "@/lib/payments/types";
import { setPendingCheckout } from "@/lib/payments/pending";
import { createLocalOrder, hasAdminApi } from "@/lib/shopify/orders";
import { localCheckoutSchema } from "@/lib/validations";
import { appUrl } from "@/lib/urls";
import { captureError } from "@/lib/monitoring";

/**
 * Custom checkout for local payments (Wave / Orange Money via a gateway, or
 * cash on delivery). Prices are ALWAYS re-fetched from Shopify server-side —
 * the client cart is never trusted for amounts.
 */

export type LocalCheckoutState = {
  ok?: boolean;
  redirectUrl?: string;
  orderName?: string;
  error?: string;
};

type CartLineInput = { variantId: string; quantity: number };

const variantPricesQuery = /* GraphQL */ `
  query VariantPrices($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        title
        price {
          amount
          currencyCode
        }
        product {
          title
        }
      }
    }
  }
`;

/** Server-side price check: build verified lines from Shopify. */
async function verifyLines(
  lines: CartLineInput[],
): Promise<{ verified: CheckoutLine[]; currencyCode: string } | null> {
  if (lines.length === 0) return null;
  const data = await shopifyFetch<{
    nodes: ({
      id: string;
      title: string;
      price: { amount: string; currencyCode: string };
      product: { title: string };
    } | null)[];
  }>({
    query: variantPricesQuery,
    variables: { ids: lines.map((l) => l.variantId) },
    revalidate: 0,
  });

  const verified: CheckoutLine[] = [];
  let currencyCode = "XOF";
  for (const line of lines) {
    const node = data.nodes.find((n) => n?.id === line.variantId);
    if (!node) return null; // unknown variant → reject
    const qty = Math.max(1, Math.min(50, Math.floor(line.quantity)));
    currencyCode = node.price.currencyCode;
    verified.push({
      variantId: node.id,
      title:
        node.title === "Default Title"
          ? node.product.title
          : `${node.product.title} — ${node.title}`,
      quantity: qty,
      unitAmount: parseFloat(node.price.amount) || 0,
    });
  }
  return { verified, currencyCode };
}

export async function localCheckoutAction(
  _prev: LocalCheckoutState,
  formData: FormData,
): Promise<LocalCheckoutState> {
  // 1. Validate the customer form.
  const parsed = localCheckoutSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    address: formData.get("address"),
    note: formData.get("note"),
    paymentMethod: formData.get("paymentMethod"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }

  // 2. Parse cart lines (ids + quantities only — prices come from Shopify).
  let lines: CartLineInput[];
  try {
    lines = JSON.parse(String(formData.get("lines") ?? "[]"));
    if (!Array.isArray(lines) || lines.length === 0) throw new Error();
  } catch {
    return { error: "Votre panier est vide." };
  }

  if (!(await hasAdminApi())) {
    return {
      error:
        "La création de commandes n'est pas configurée (token Admin Shopify requis avec write_orders).",
    };
  }

  // 3. Verify prices server-side.
  const checked = await verifyLines(lines);
  if (!checked) {
    return { error: "Panier invalide — veuillez réessayer." };
  }
  const { verified, currencyCode } = checked;
  const total = verified.reduce((n, l) => n + l.unitAmount * l.quantity, 0);

  const customer: CheckoutCustomer = {
    name: parsed.data.name,
    phone: parsed.data.phone.replace(/\s+/g, " ").trim(),
    city: parsed.data.city,
    address: parsed.data.address,
    note: parsed.data.note || null,
  };

  const reference = `LC-${crypto.randomBytes(6).toString("hex")}`;

  // ── Cash on delivery: create the Shopify order immediately (PENDING). ──
  if (parsed.data.paymentMethod === "cod") {
    try {
      const order = await createLocalOrder({
        reference,
        customer,
        lines: verified,
        currencyCode,
        paid: false,
        paymentLabel: "Paiement à la livraison",
      });
      return { ok: true, orderName: order.name };
    } catch (e) {
      captureError(e, { stage: "cod-order" });
      return { error: "Impossible d'enregistrer la commande. Réessayez." };
    }
  }

  // ── Mobile money: create a gateway session and redirect. ──
  const provider = getPaymentProvider();
  if (!provider) {
    return {
      error:
        "Le paiement mobile money n'est pas encore configuré. Choisissez le paiement à la livraison.",
    };
  }

  try {
    const base = appUrl();
    const session = await provider.createSession({
      reference,
      amount: total,
      currencyCode,
      description: `Commande ${reference}`,
      customer,
      lines: verified,
      returnUrl: `${base}/api/payments/callback`,
      cancelUrl: `${base}/checkout?cancelled=1`,
    });

    // Carry the pending order across the gateway redirect (signed cookie).
    await setPendingCheckout({
      reference,
      provider: provider.name,
      token: session.token,
      customer,
      lines: verified.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
    });

    return { ok: true, redirectUrl: session.redirectUrl };
  } catch (e) {
    captureError(e, { stage: "gateway-session", provider: provider.name });
    return {
      error:
        "Le service de paiement est momentanément indisponible. Réessayez ou choisissez le paiement à la livraison.",
    };
  }
}
