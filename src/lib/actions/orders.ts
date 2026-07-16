"use server";

import { adminFetch, hasAdminApi } from "@/lib/shopify/admin";
import { trackOrderSchema } from "@/lib/validations";
import { MOCK_ORDERS } from "@/lib/mock/orders";

export type TrackingStep = { label: string; done: boolean };
export type TrackingResult = {
  found: boolean;
  orderNumber?: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  steps?: TrackingStep[];
  error?: string;
};

const STANDARD_STEPS = [
  "Commande confirmée",
  "En préparation",
  "Expédiée",
  "En cours de livraison",
  "Livrée",
];

/** Build the 5-step timeline from a Shopify fulfilment status. */
function stepsFor(fulfillmentStatus: string, hasTracking: boolean): TrackingStep[] {
  const s = fulfillmentStatus.toUpperCase();
  const reached =
    s === "FULFILLED"
      ? 5
      : s === "IN_PROGRESS" || s === "PARTIALLY_FULFILLED"
        ? hasTracking
          ? 4
          : 3
        : hasTracking
          ? 3
          : 2;
  return STANDARD_STEPS.map((label, i) => ({ label, done: i < reached }));
}

const orderLookupQuery = /* GraphQL */ `
  query trackOrder($query: String!) {
    orders(first: 1, query: $query) {
      edges {
        node {
          name
          email
          displayFulfillmentStatus
          fulfillments(first: 1) {
            status
            trackingInfo(first: 1) {
              company
              number
              url
            }
          }
        }
      }
    }
  }
`;

type OrderLookupNode = {
  name: string;
  email: string | null;
  displayFulfillmentStatus: string;
  fulfillments: {
    status: string;
    trackingInfo: { company: string | null; number: string | null; url: string | null }[];
  }[];
};

/** Look up an order for the public tracking page (name + email must match). */
export async function trackOrderAction(
  _prev: TrackingResult,
  formData: FormData,
): Promise<TrackingResult> {
  const parsed = trackOrderSchema.safeParse({
    orderNumber: formData.get("orderNumber"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { found: false, error: parsed.error.issues[0]?.message };
  }

  const rawNumber = parsed.data.orderNumber.replace(/^#/, "").trim();
  const email = parsed.data.email.trim().toLowerCase();

  if (await hasAdminApi()) {
    try {
      const data = await adminFetch<{
        orders: { edges: { node: OrderLookupNode }[] };
      }>({
        query: orderLookupQuery,
        variables: { query: `name:#${rawNumber} email:${email}` },
      });

      const node = data.orders.edges[0]?.node;
      if (!node || node.email?.toLowerCase() !== email) {
        return { found: false, error: "Aucune commande trouvée pour ces informations." };
      }

      const tracking = node.fulfillments[0]?.trackingInfo[0];
      return {
        found: true,
        orderNumber: node.name,
        carrier: tracking?.company ?? null,
        trackingNumber: tracking?.number ?? null,
        trackingUrl: tracking?.url ?? null,
        steps: stepsFor(node.displayFulfillmentStatus, Boolean(tracking?.number)),
      };
    } catch {
      return { found: false, error: "Service de suivi indisponible. Réessayez." };
    }
  }

  // Demo fallback.
  const demo = MOCK_ORDERS.find((o) => o.number.replace("#", "") === rawNumber);
  if (!demo?.tracking) {
    return { found: false, error: "Aucune commande trouvée. Essayez « 1042 » en démo." };
  }
  return {
    found: true,
    orderNumber: demo.number,
    carrier: demo.tracking.carrier,
    trackingNumber: demo.tracking.number,
    trackingUrl: null,
    steps: demo.tracking.steps,
  };
}
