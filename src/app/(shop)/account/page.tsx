import type { Metadata } from "next";
import Link from "next/link";
import { Download, MapPin, Package, User } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { resolveTenant } from "@/lib/tenant/registry";
import { getCurrentCustomer, logoutAction } from "@/lib/auth/actions";
import type { Customer, CustomerOrder } from "@/lib/auth/customer";
import { MOCK_ORDERS } from "@/lib/mock/orders";

export const metadata: Metadata = {
  title: "Mon compte",
  robots: { index: false, follow: false },
};

/** Adapt demo orders to the live customer-order shape so the UI is uniform. */
function demoOrders(): CustomerOrder[] {
  return MOCK_ORDERS.map((o, i) => ({
    id: o.id,
    orderNumber: Number(o.number.replace("#", "")) || i,
    processedAt: o.date,
    financialStatus: "PAID",
    fulfillmentStatus: o.status === "delivered" ? "FULFILLED" : "IN_PROGRESS",
    statusUrl: "#",
    total: { amount: o.total, currencyCode: o.currencyCode },
    items: o.items.map((it) => ({ title: it.title, quantity: it.quantity, image: it.image })),
  }));
}

export default async function AccountPage() {
  const tenant = await resolveTenant();
  const shopifyReady = Boolean(
    tenant.shopify.storeDomain && tenant.shopify.storefrontAccessToken,
  );
  const customer = shopifyReady ? await getCurrentCustomer() : null;

  // Real account when signed in; demo data otherwise (so the page is never empty).
  const isDemo = !customer;
  const orders = customer?.orders ?? demoOrders();
  const name = customer
    ? customer.displayName || `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim()
    : "Marie Dupont";
  const address = customer?.defaultAddress;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Bonjour {name || "👋"} 👋
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {isDemo
              ? "Aperçu de démonstration de votre espace client."
              : "Bienvenue dans votre espace client."}
          </p>
        </div>
        {isDemo ? (
          <Link
            href="/login"
            className="inline-flex h-10 items-center rounded-full bg-[hsl(var(--accent))] px-5 text-sm font-medium text-[hsl(var(--accent-foreground))]"
          >
            Se connecter
          </Link>
        ) : (
          <form action={logoutAction}>
            <button className="inline-flex h-10 items-center rounded-full border border-[hsl(var(--border))] px-5 text-sm hover:bg-[hsl(var(--muted))]">
              Se déconnecter
            </button>
          </form>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-[hsl(var(--border))] p-6">
          <User className="mb-3 h-6 w-6" />
          <h2 className="font-semibold">Profil</h2>
          <dl className="mt-3 space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
            <dd>{name}</dd>
            <dd>{customer?.email ?? "marie@exemple.com"}</dd>
            <dd>{customer?.phone ?? "+33 6 12 34 56 78"}</dd>
          </dl>
        </div>

        <div className="rounded-3xl border border-[hsl(var(--border))] p-6">
          <MapPin className="mb-3 h-6 w-6" />
          <h2 className="font-semibold">Adresse par défaut</h2>
          <address className="mt-3 space-y-0.5 text-sm not-italic text-[hsl(var(--muted-foreground))]">
            {address ? (
              <>
                <div>{address.address1}</div>
                {address.address2 && <div>{address.address2}</div>}
                <div>
                  {address.zip} {address.city}
                </div>
                <div>{address.country}</div>
              </>
            ) : (
              <>
                <div>12 rue de la Mode</div>
                <div>75002 Paris</div>
                <div>France</div>
              </>
            )}
          </address>
        </div>

        <div className="rounded-3xl border border-[hsl(var(--border))] p-6">
          <Package className="mb-3 h-6 w-6" />
          <h2 className="font-semibold">Commandes</h2>
          <p className="mt-3 text-3xl font-semibold">{orders.length}</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            commandes passées
          </p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Historique des commandes</h2>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-4 rounded-2xl border border-[hsl(var(--border))] p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">Commande #{order.orderNumber}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {new Date(order.processedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  · {order.items.length} article{order.items.length > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="muted">
                  {order.fulfillmentStatus === "FULFILLED" ? "Livrée" : "En cours"}
                </Badge>
                <span className="font-medium tabular-nums">
                  {formatPrice(order.total.amount, order.total.currencyCode)}
                </span>
                <div className="flex gap-2">
                  <Link
                    href={`/track?order=${order.orderNumber}`}
                    className="rounded-full border border-[hsl(var(--border))] px-4 py-1.5 text-sm hover:bg-[hsl(var(--muted))]"
                  >
                    Suivre
                  </Link>
                  <a
                    href={order.statusUrl}
                    className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border))] px-4 py-1.5 text-sm hover:bg-[hsl(var(--muted))]"
                  >
                    <Download className="h-4 w-4" /> Facture
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
