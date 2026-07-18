import { DollarSign, Eye, Percent, ShoppingCart } from "lucide-react";
import { getDashboardMetrics } from "@/lib/admin/analytics";
import { formatPrice } from "@/lib/utils";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { Badge } from "@/components/ui/badge";
export const revalidate = 300;

/** Human-friendly label for both demo statuses and Shopify fulfilment states. */
const STATUS_LABELS: Record<string, string> = {
  processing: "En traitement",
  shipped: "Expédiée",
  delivered: "Livrée",
  canceled: "Annulée",
  fulfilled: "Livrée",
  unfulfilled: "En préparation",
  partially_fulfilled: "Partielle",
  in_progress: "En cours",
  on_hold: "En attente",
  scheduled: "Planifiée",
  // Native order statuses
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
};

function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export default async function AdminDashboard() {
  const m = await getDashboardMetrics();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vue d'ensemble</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {m.source === "native"
              ? "Données en temps réel de vos commandes."
              : m.source === "shopify"
                ? "Données en temps réel depuis Shopify (90 derniers jours)."
                : "Indicateurs clés de votre boutique."}
          </p>
        </div>
        <Badge variant={m.source === "demo" ? "muted" : "default"}>
          {m.source === "native"
            ? "Live"
            : m.source === "shopify"
              ? "Shopify · live"
              : "Démo"}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Chiffre d'affaires"
          value={formatPrice(m.revenue, m.currency)}
          change={m.revenueChange}
          icon={DollarSign}
        />
        <StatCard
          label="Commandes"
          value={m.orders.toLocaleString("fr-FR")}
          change={m.ordersChange}
          icon={ShoppingCart}
        />
        <StatCard
          label="Visiteurs"
          value={m.visitors !== null ? m.visitors.toLocaleString("fr-FR") : "—"}
          change={m.visitorsChange}
          icon={Eye}
        />
        <StatCard
          label="Taux de conversion"
          value={m.conversionRate !== null ? `${m.conversionRate}%` : "—"}
          icon={Percent}
        />
      </div>
      {m.source === "shopify" && m.visitors === null && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Visiteurs & conversion : connectez Google Analytics dans les paramètres
          pour les afficher (l'API Admin ne fournit pas le trafic web).
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <RevenueChart data={m.revenueSeries} />

        <div className="rounded-2xl border border-[hsl(var(--border))] p-5">
          <h3 className="mb-4 font-semibold">Produits populaires</h3>
          <ul className="space-y-4">
            {m.topProducts.map((p, i) => (
              <li key={p.title} className="flex items-center gap-3">
                <span className="w-4 text-sm text-[hsl(var(--muted-foreground))]">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {p.units} vendus
                  </p>
                </div>
                <span className="text-sm font-medium tabular-nums">
                  {formatPrice(p.revenue, m.currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-[hsl(var(--border))] p-5">
        <h3 className="mb-4 font-semibold">Commandes récentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] text-left text-[hsl(var(--muted-foreground))]">
                <th className="pb-3 font-medium">Commande</th>
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Statut</th>
                <th className="pb-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {m.recentOrders.map((o) => (
                <tr key={o.number} className="border-b border-[hsl(var(--border))] last:border-0">
                  <td className="py-3 font-medium">{o.number}</td>
                  <td className="py-3 text-[hsl(var(--muted-foreground))]">
                    {o.customer}
                  </td>
                  <td className="py-3">
                    <Badge variant="muted">{statusLabel(o.status)}</Badge>
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    {formatPrice(o.total, m.currency)}
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
