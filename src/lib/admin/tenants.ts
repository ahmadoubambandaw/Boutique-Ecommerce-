import "server-only";
import { PLANS } from "@/lib/tenant/plans";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/tenant/types";

/**
 * Super-Admin view over all tenants. In production this queries the tenant
 * registry DB + Stripe for live subscription/MRR data. Demo data below.
 */

export type TenantSummary = {
  id: string;
  storeName: string;
  domain: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  mrr: number;
  createdAt: string;
  orders30d: number;
};

const DEMO_TENANTS: TenantSummary[] = [
  { id: "t1", storeName: "Aurora Studio", domain: "aurora.boutique.app", plan: "pro", status: "active", mrr: PLANS.pro.priceMonthly, createdAt: "2025-11-02", orders30d: 412 },
  { id: "t2", storeName: "Maison Lume", domain: "lume.fr", plan: "enterprise", status: "active", mrr: PLANS.enterprise.priceMonthly, createdAt: "2025-09-18", orders30d: 1893 },
  { id: "t3", storeName: "Kite Apparel", domain: "kite.boutique.app", plan: "basic", status: "trialing", mrr: 0, createdAt: "2026-07-01", orders30d: 37 },
  { id: "t4", storeName: "Horizon Goods", domain: "horizon.boutique.app", plan: "pro", status: "past_due", mrr: PLANS.pro.priceMonthly, createdAt: "2026-02-11", orders30d: 128 },
  { id: "t5", storeName: "Atelier Nord", domain: "ateliernord.com", plan: "enterprise", status: "active", mrr: PLANS.enterprise.priceMonthly, createdAt: "2025-12-20", orders30d: 967 },
  { id: "t6", storeName: "Belle Époque", domain: "belle.boutique.app", plan: "basic", status: "suspended", mrr: 0, createdAt: "2026-01-05", orders30d: 0 },
];

export type PlatformOverview = {
  tenants: TenantSummary[];
  totalMrr: number;
  activeCount: number;
  trialingCount: number;
  planBreakdown: Record<SubscriptionPlan, number>;
};

export async function getPlatformOverview(): Promise<PlatformOverview> {
  const tenants = DEMO_TENANTS;
  const totalMrr = tenants.reduce((n, t) => n + t.mrr, 0);
  const activeCount = tenants.filter((t) => t.status === "active").length;
  const trialingCount = tenants.filter((t) => t.status === "trialing").length;

  const planBreakdown = tenants.reduce(
    (acc, t) => {
      acc[t.plan] = (acc[t.plan] ?? 0) + 1;
      return acc;
    },
    { basic: 0, pro: 0, enterprise: 0 } as Record<SubscriptionPlan, number>,
  );

  return { tenants, totalMrr, activeCount, trialingCount, planBreakdown };
}
