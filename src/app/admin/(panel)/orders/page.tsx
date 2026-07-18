import { Banknote, Smartphone } from "lucide-react";
import { listOrders } from "@/lib/commerce/repository";
import { isDbConfigured } from "@/lib/db/client";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminOrdersPage() {
  const orders = await listOrders();
  const readOnly = !isDbConfigured();

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((n, o) => n + o.total, 0);
  const currency = orders[0]?.currency ?? "XOF";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Commandes</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {orders.length} commande{orders.length > 1 ? "s" : ""}
          {orders.length > 0 && ` · ${formatPrice(revenue, currency)} de chiffre d'affaires`}
        </p>
      </div>

      {readOnly && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          Mode démo : connectez une base de données pour recevoir de vraies
          commandes.
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-[hsl(var(--border))] p-12 text-center text-[hsl(var(--muted-foreground))]">
          Aucune commande pour le moment.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="rounded-2xl border border-[hsl(var(--border))] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">#{o.orderNumber}</span>
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                      {formatDate(o.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">
                    {o.address.fullName} · {o.address.phone}
                  </p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {o.address.address}, {o.address.city}
                    {o.address.region ? `, ${o.address.region}` : ""}
                  </p>
                  {o.address.note && (
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                      Note : {o.address.note}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-lg font-semibold tabular-nums">
                    {formatPrice(o.total, o.currency)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                    {o.paymentMethod === "mobile_money" ? (
                      <>
                        <Smartphone className="h-3.5 w-3.5" /> Mobile money
                      </>
                    ) : (
                      <>
                        <Banknote className="h-3.5 w-3.5" /> À la livraison
                      </>
                    )}
                  </span>
                  <OrderStatusSelect
                    id={o.id}
                    status={o.status}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <ul className="mt-4 space-y-1 border-t border-[hsl(var(--border))] pt-4 text-sm">
                {o.items.map((item, i) => (
                  <li
                    key={`${item.productId}-${i}`}
                    className="flex justify-between gap-2"
                  >
                    <span className="text-[hsl(var(--muted-foreground))]">
                      {item.title}
                      {item.variantTitle && item.variantTitle !== "Default Title"
                        ? ` · ${item.variantTitle}`
                        : ""}{" "}
                      × {item.quantity}
                    </span>
                    <span className="tabular-nums">
                      {formatPrice(item.price * item.quantity, o.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
