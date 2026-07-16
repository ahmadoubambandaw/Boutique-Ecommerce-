import "server-only";
import { resolveTenant } from "@/lib/tenant/registry";
import { MOCK_PRODUCTS } from "@/lib/mock/data";
import { MOCK_ORDERS } from "@/lib/mock/orders";

/**
 * Read-only store analytics for the merchant dashboard.
 *
 * In production every figure is fetched from the Shopify Admin API
 * (orders, customers, analytics) — the dashboard never mutates catalog data.
 * Until Admin credentials are set we return representative demo metrics.
 */

export type DashboardMetrics = {
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  visitors: number;
  visitorsChange: number;
  conversionRate: number;
  currency: string;
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

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  await resolveTenant(); // scope to the active tenant

  // Deterministic demo series (last 12 weeks).
  const revenueSeries = Array.from({ length: 12 }, (_, i) => ({
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
    customer: ["Marie D.", "Lucas M.", "Emma R.", "Noah B."][
      Number(o.id) % 4
    ] as string,
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
    revenueSeries,
    topProducts,
    recentOrders,
  };
}
