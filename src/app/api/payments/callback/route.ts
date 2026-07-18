import { NextResponse } from "next/server";
import { paydunya } from "@/lib/payments/paydunya";
import { cinetpay } from "@/lib/payments/cinetpay";
import {
  clearPendingCheckout,
  readPendingCheckout,
} from "@/lib/payments/pending";
import { createLocalOrder, findOrderByReference } from "@/lib/shopify/orders";
import { shopifyFetch } from "@/lib/shopify/client";
import { appUrl } from "@/lib/urls";
import { captureError } from "@/lib/monitoring";

/**
 * Gateway return URL. We NEVER trust redirect/query params: the payment is
 * confirmed server-to-server with the gateway, then the order is written into
 * Shopify (idempotently — refreshing this page cannot duplicate the order).
 */

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

export async function GET() {
  const base = appUrl();
  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/checkout?failed=${reason}`, base));

  const pending = await readPendingCheckout();
  if (!pending) return fail("session");

  const provider = pending.provider === "paydunya" ? paydunya : cinetpay;

  try {
    // 1. Confirm the payment with the gateway (server-to-server).
    const verification = await provider.verify(pending.token);
    if (verification.status === "pending") {
      return NextResponse.redirect(new URL("/checkout/attente", base));
    }
    if (verification.status !== "paid") {
      return fail("payment");
    }

    // 2. Idempotency: if the order already exists, just show it.
    const existing = await findOrderByReference(pending.reference);
    if (existing) {
      await clearPendingCheckout();
      return NextResponse.redirect(
        new URL(`/checkout/merci?order=${encodeURIComponent(existing.name)}`, base),
      );
    }

    // 3. Re-verify prices from Shopify and create the PAID order.
    const data = await shopifyFetch<{
      nodes: ({
        id: string;
        title: string;
        price: { amount: string; currencyCode: string };
        product: { title: string };
      } | null)[];
    }>({
      query: variantPricesQuery,
      variables: { ids: pending.lines.map((l) => l.variantId) },
      revalidate: 0,
    });

    let currencyCode = "XOF";
    const lines = pending.lines.flatMap((l) => {
      const node = data.nodes.find((n) => n?.id === l.variantId);
      if (!node) return [];
      currencyCode = node.price.currencyCode;
      return [
        {
          variantId: node.id,
          title:
            node.title === "Default Title"
              ? node.product.title
              : `${node.product.title} — ${node.title}`,
          quantity: l.quantity,
          unitAmount: parseFloat(node.price.amount) || 0,
        },
      ];
    });
    if (lines.length === 0) return fail("cart");

    const order = await createLocalOrder({
      reference: pending.reference,
      customer: pending.customer,
      lines,
      currencyCode,
      paid: true,
      paymentLabel: `Mobile money (${provider.name})`,
    });

    await clearPendingCheckout();
    return NextResponse.redirect(
      new URL(`/checkout/merci?order=${encodeURIComponent(order.name)}&paid=1`, base),
    );
  } catch (e) {
    captureError(e, { stage: "payment-callback", reference: pending.reference });
    return fail("error");
  }
}
