import "server-only";
import { adminFetch, hasAdminApi } from "./admin";
import type { CheckoutCustomer, CheckoutLine } from "@/lib/payments/types";

/**
 * Write orders into Shopify from the custom (local-payment) checkout.
 * Requires an Admin token with `write_orders` + `read_orders` scopes.
 * Shopify remains the single source of truth for orders.
 */

const orderCreateMutation = /* GraphQL */ `
  mutation CreateLocalOrder($order: OrderCreateOrderInput!) {
    orderCreate(order: $order) {
      order {
        id
        name
        statusPageUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const findOrderQuery = /* GraphQL */ `
  query FindOrderByTag($query: String!) {
    orders(first: 1, query: $query) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

export type CreatedOrder = { id: string; name: string; statusPageUrl: string | null };

/** Idempotency guard: has an order already been created for this reference? */
export async function findOrderByReference(
  reference: string,
): Promise<CreatedOrder | null> {
  const data = await adminFetch<{
    orders: { edges: { node: CreatedOrder }[] };
  }>({
    query: findOrderQuery,
    variables: { query: `tag:'${reference}'` },
  });
  return data.orders.edges[0]?.node ?? null;
}

export async function createLocalOrder(opts: {
  reference: string;
  customer: CheckoutCustomer;
  lines: CheckoutLine[];
  currencyCode: string;
  paid: boolean;
  paymentLabel: string; // e.g. "Wave / Orange Money (PayDunya)" or "Paiement à la livraison"
}): Promise<CreatedOrder> {
  const [firstName, ...rest] = opts.customer.name.trim().split(/\s+/);
  const lastName = rest.join(" ") || firstName;

  const note = [
    `Paiement : ${opts.paymentLabel}`,
    `Téléphone : ${opts.customer.phone}`,
    opts.customer.note ? `Note client : ${opts.customer.note}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const data = await adminFetch<{
    orderCreate: {
      order: CreatedOrder | null;
      userErrors: { field: string[] | null; message: string }[];
    };
  }>({
    query: orderCreateMutation,
    variables: {
      order: {
        currency: opts.currencyCode,
        financialStatus: opts.paid ? "PAID" : "PENDING",
        lineItems: opts.lines.map((l) => ({
          variantId: l.variantId,
          quantity: l.quantity,
        })),
        shippingAddress: {
          firstName,
          lastName,
          address1: opts.customer.address,
          city: opts.customer.city,
          countryCode: "SN",
          phone: opts.customer.phone,
        },
        note,
        tags: [opts.reference, opts.paid ? "mobile-money" : "cod"],
      },
    },
  });

  const errors = data.orderCreate.userErrors;
  if (errors.length > 0 || !data.orderCreate.order) {
    throw new Error(errors[0]?.message ?? "Échec de la création de commande.");
  }
  return data.orderCreate.order;
}

export { hasAdminApi };
