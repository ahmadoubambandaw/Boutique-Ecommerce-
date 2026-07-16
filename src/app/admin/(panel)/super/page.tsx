import { redirect } from "next/navigation";
import { Building2, TrendingUp, Users, Wallet } from "lucide-react";
import { getPlatformOverview } from "@/lib/admin/tenants";
import { getAdminSession } from "@/lib/auth/admin-actions";
import { isDbConfigured } from "@/lib/db/client";
import { formatPrice } from "@/lib/utils";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/tenant/plans";
import { TenantActions } from "@/components/admin/tenant-actions";

export const revalidate = 300;

const STATUS_STYLE: Record<string, "default" | "muted" | "sale" | "outline"> = {
  active: "default",
  trialing: "outline",
  past_due: "sale",
  suspended: "muted",
  canceled: "muted",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Actif",
  trialing: "Essai",
  past_due: "Impayé",
  suspended: "Suspendu",
  canceled: "Annulé",
};

export default async function SuperAdminPage() {
  // Defense in depth: the middleware already gates this route, but re-check the
  // role server-side when a database is configured.
  if (isDbConfigured()) {
    const session = await getAdminSession();
    if (session?.role !== "super_admin") redirect("/admin");
  }

  const o = await getPlatformOverview();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Super Admin</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Pilotez l'ensemble des boutiques de la plateforme.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="MRR"
          value={formatPrice(o.totalMrr, "EUR")}
          change={9.2}
          icon={Wallet}
        />
        <StatCard
          label="Boutiques"
          value={o.tenants.length.toString()}
          change={4.5}
          icon={Building2}
        />
        <StatCard label="Actives" value={o.activeCount.toString()} icon={Users} />
        <StatCard
          label="En essai"
          value={o.trialingCount.toString()}
          icon={TrendingUp}
        />
      </div>

      {/* Plan breakdown */}
      <div className="grid gap-4 sm:grid-cols-3">
        {(Object.keys(PLANS) as (keyof typeof PLANS)[]).map((key) => (
          <div key={key} className="rounded-2xl border border-[hsl(var(--border))] p-5">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Plan {PLANS[key].name}
            </p>
            <p className="mt-1 text-2xl font-semibold">{o.planBreakdown[key]}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {formatPrice(PLANS[key].priceMonthly, "EUR")}/mois
            </p>
          </div>
        ))}
      </div>

      {/* Tenants table */}
      <div className="rounded-2xl border border-[hsl(var(--border))] p-5">
        <h3 className="mb-4 font-semibold">Toutes les boutiques</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] text-left text-[hsl(var(--muted-foreground))]">
                <th className="pb-3 font-medium">Boutique</th>
                <th className="pb-3 font-medium">Domaine</th>
                <th className="pb-3 font-medium">Plan</th>
                <th className="pb-3 font-medium">Statut</th>
                <th className="pb-3 text-right font-medium">MRR</th>
                <th className="pb-3 text-right font-medium">Cmd. 30j</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {o.tenants.map((t) => (
                <tr key={t.id} className="border-b border-[hsl(var(--border))] last:border-0">
                  <td className="py-3 font-medium">{t.storeName}</td>
                  <td className="py-3 text-[hsl(var(--muted-foreground))]">
                    {t.domain}
                  </td>
                  <td className="py-3 capitalize">{t.plan}</td>
                  <td className="py-3">
                    <Badge variant={STATUS_STYLE[t.status]}>
                      {STATUS_LABEL[t.status]}
                    </Badge>
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    {formatPrice(t.mrr, "EUR")}
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    {t.orders30d.toLocaleString("fr-FR")}
                  </td>
                  <td className="py-3 text-right">
                    <TenantActions tenantId={t.id} suspended={t.status === "suspended"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
