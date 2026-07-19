import "server-only";
import { resolveTenant } from "@/lib/tenant/registry";
import { adminFetch, hasAdminApi } from "@/lib/shopify/admin";
import { MOCK_PRODUCTS } from "@/lib/mock/data";
import { MOCK_ORDERS } from "@/lib/mock/orders";
import { listOrders } from "@/lib/commerce/repository";
import { countVisits } from "@/lib/commerce/visits";

/**
 * Read-only store analytics for the merchant dashboard.
 *
 * When the tenant has Admin API access we compute real figures from Shopify
 * orders; otherwise we return representative demo metrics so the dashboard is
 * never empty. The dashboard never mutates catalogue data.
 */

export type DashboardMetrics = {
  revenue: number;
  revenueChange: number | null;
  orders: number;
  ordersChange: number | null;
  /** Visitors require a web-analytics source (GA/Plausible) — null via Admin API. */
  visitors: number | null;
  visitorsChange: number | null;
  conversionRate: number | null;
  currency: string;
  source: "native" | "shopify" | "demo";
  revenueSeries: { label: string; value: number }[];
  topProducts: { title: string; units: number; revenue: number; image: string | null }[];
  recentOrders: {
    number: string;
    customer: string;
    total: number;
    status: string;
    date: string;
  }[];
};

const WEEKS = 12;
const DAYS = WEEKS * 7;

type OrderNode = {
  name: string;
  createdAt: string;
  displayFulfillmentStatus: string;
  currentTotalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
  customer: { displayName: string } | null;
  lineItems: {
    edges: {
      node: {
        title: string;
        quantity: number;
        image: { url: string } | null;
        originalTotalSet: { shopMoney: { amount: string } };
      };
    }[];
  };
};

const ordersQuery = /* GraphQL */ `
  query dashboardOrders($query: String!) {
    ordersCount(query: $query) {
      count
    }
    orders(first: 250, query: $query, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          name
          createdAt
          displayFulfillmentStatus
          currentTotalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          customer {
            displayName
          }
          lineItems(first: 10) {
            edges {
              node {
                title
                quantity
                image {
                  url
                }
                originalTotalSet {
                  shopMoney {
                    amount
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

async function getShopifyMetrics(): Promise<DashboardMetrics | null> {
  const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000);
  const query = `created_at:>=${since.toISOString()}`;

  const data = await adminFetch<{
    ordersCount: { count: number };
    orders: { edges: { node: OrderNode }[] };
  }>({ query: ordersQuery, variables: { query } });

  const orders = data.orders.edges.map((e) => e.node);
  if (orders.length === 0) return null;

  const currency =
    orders[0]?.currentTotalPriceSet.shopMoney.currencyCode ?? "EUR";

  // Revenue + weekly series.
  const series = Array.from({ length: WEEKS }, (_, i) => ({
    label: `S${i + 1}`,
    value: 0,
  }));
  let revenue = 0;
  const now = Date.now();

  for (const o of orders) {
    const amount = parseFloat(o.currentTotalPriceSet.shopMoney.amount) || 0;
    revenue += amount;
    const ageDays = (now - new Date(o.createdAt).getTime()) / (24 * 60 * 60 * 1000);
    const weekIndex = WEEKS - 1 - Math.min(WEEKS - 1, Math.floor(ageDays / 7));
    if (series[weekIndex]) series[weekIndex].value += Math.round(amount);
  }

  // Top products by units sold.
  const productMap = new Map<string, { units: number; revenue: number; image: string | null }>();
  for (const o of orders) {
    for (const { node: li } of o.lineItems.edges) {
      const entry = productMap.get(li.title) ?? { units: 0, revenue: 0, image: li.image?.url ?? null };
      entry.units += li.quantity;
      entry.revenue += parseFloat(li.originalTotalSet.shopMoney.amount) || 0;
      if (!entry.image && li.image?.url) entry.image = li.image.url;
      productMap.set(li.title, entry);
    }
  }
  const topProducts = [...productMap.entries()]
    .map(([title, v]) => ({ title, ...v }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  const recentOrders = orders.slice(0, 8).map((o) => ({
    number: o.name,
    customer: o.customer?.displayName ?? "Client",
    total: parseFloat(o.currentTotalPriceSet.shopMoney.amount) || 0,
    status: o.displayFulfillmentStatus?.toLowerCase() ?? "processing",
    date: o.createdAt,
  }));

  return {
    revenue: Math.round(revenue),
    revenueChange: null,
    orders: data.ordersCount.count,
    ordersChange: null,
    visitors: null,
    visitorsChange: null,
    conversionRate: null,
    currency,
    source: "shopify",
    revenueSeries: series,
    topProducts,
    recentOrders,
  };
}

/** Real metrics computed from our own (native) orders in Postgres. */
async function getNativeMetrics(): Promise<DashboardMetrics | null> {
  const [orders, visitors] = await Promise.all([
    listOrders().catch(() => []),
    countVisits(DAYS).catch(() => 0),
  ]);
  if (orders.length === 0 && visitors === 0) return null;

  const currency = orders[0]?.currency ?? "XOF";
  const paid = orders.filter((o) => o.status !== "cancelled");

  const series = Array.from({ length: WEEKS }, (_, i) => ({
    label: `S${i + 1}`,
    value: 0,
  }));
  const now = Date.now();
  let revenue = 0;
  for (const o of paid) {
    revenue += o.total;
    const ageDays =
      (now - new Date(o.createdAt).getTime()) / (24 * 60 * 60 * 1000);
    const weekIndex = WEEKS - 1 - Math.min(WEEKS - 1, Math.floor(ageDays / 7));
    if (series[weekIndex]) series[weekIndex].value += Math.round(o.total);
  }

  const productMap = new Map<
    string,
    { units: number; revenue: number; image: string | null }
  >();
  for (const o of paid) {
    for (const item of o.items) {
      const entry =
        productMap.get(item.title) ?? {
          units: 0,
          revenue: 0,
          image: item.image,
        };
      entry.units += item.quantity;
      entry.revenue += item.price * item.quantity;
      if (!entry.image && item.image) entry.image = item.image;
      productMap.set(item.title, entry);
    }
  }
  const topProducts = [...productMap.entries()]
    .map(([title, v]) => ({ title, ...v }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  const recentOrders = orders.slice(0, 8).map((o) => ({
    number: `#${o.orderNumber}`,
    customer: o.address.fullName,
    total: o.total,
    status: o.status,
    date: o.createdAt,
  }));

  return {
    revenue: Math.round(revenue),
    revenueChange: null,
    orders: orders.length,
    ordersChange: null,
    visitors: visitors > 0 ? visitors : null,
    visitorsChange: null,
    conversionRate:
      visitors > 0
        ? Math.round((orders.length / visitors) * 1000) / 10
        : null,
    currency,
    source: "native",
    revenueSeries: series,
    topProducts,
    recentOrders,
  };
}

function getDemoMetrics(): DashboardMetrics {
  const revenueSeries = Array.from({ length: WEEKS }, (_, i) => ({
    label: `S${i + 1}`,
    value: Math.round(3200 + Math.sin(i / 1.6) * 1400 + i * 180),
  }));
  const revenue = revenueSeries.reduce((n, p) => n + p.value, 0);

  const topProducts = MOCK_PRODUCTS.slice(0, 5).map((p, i) => ({
    title: p.title,
    units: 240 - i * 38,
    revenue: (240 - i * 38) * parseFloat(p.priceRange.minVariantPrice.amount),
    image: p.featuredImage?.url ?? null,
  }));

  const recentOrders = MOCK_ORDERS.map((o) => ({
    number: o.number,
    customer: ["Marie D.", "Lucas M.", "Emma R.", "Noah B."][Number(o.id) % 4] as string,
    total: parseFloat(o.total),
    status: o.status,
    date: o.date,
  }));

  return {
    revenue,
    revenueChange: 12.4,
    orders: 1284,
    ordersChange: 8.1,
    visitors: 48200,
    visitorsChange: 15.7,
    conversionRate: 2.66,
    currency: "EUR",
    source: "demo",
    revenueSeries,
    topProducts,
    recentOrders,
  };
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  // 1. Our own orders (native DB) take priority — this is the real store data.
  const native = await getNativeMetrics();
  if (native) return native;

  await resolveTenant();
  if (await hasAdminApi()) {
    try {
      const real = await getShopifyMetrics();
      if (real) return real;
    } catch {
      // Admin API hiccup → fall back to demo so the dashboard still renders.
    }
  }
  return getDemoMetrics();
}
