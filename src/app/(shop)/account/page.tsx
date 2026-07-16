import type { Metadata } from "next";
import Link from "next/link";
import { Download, MapPin, Package, User } from "lucide-react";
import { MOCK_ORDERS, STATUS_LABEL } from "@/lib/mock/orders";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Mon compte",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Bonjour 👋</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Bienvenue dans votre espace client.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex h-10 items-center rounded-full border border-[hsl(var(--border))] px-5 text-sm hover:bg-[hsl(var(--muted))]"
        >
          Se déconnecter
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile */}
        <div className="rounded-3xl border border-[hsl(var(--border))] p-6">
          <User className="mb-3 h-6 w-6" />
          <h2 className="font-semibold">Profil</h2>
          <dl className="mt-3 space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
            <dd>Marie Dupont</dd>
            <dd>marie@exemple.com</dd>
            <dd>+33 6 12 34 56 78</dd>
          </dl>
          <button className="mt-4 text-sm underline">Modifier</button>
        </div>

        {/* Address */}
        <div className="rounded-3xl border border-[hsl(var(--border))] p-6">
          <MapPin className="mb-3 h-6 w-6" />
          <h2 className="font-semibold">Adresse par défaut</h2>
          <address className="mt-3 space-y-0.5 text-sm not-italic text-[hsl(var(--muted-foreground))]">
            <div>12 rue de la Mode</div>
            <div>75002 Paris</div>
            <div>France</div>
          </address>
          <button className="mt-4 text-sm underline">Gérer les adresses</button>
        </div>

        {/* Stats */}
        <div className="rounded-3xl border border-[hsl(var(--border))] p-6">
          <Package className="mb-3 h-6 w-6" />
          <h2 className="font-semibold">Commandes</h2>
          <p className="mt-3 text-3xl font-semibold">{MOCK_ORDERS.length}</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            commandes passées
          </p>
        </div>
      </div>

      {/* Order history */}
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Historique des commandes</h2>
        <div className="space-y-4">
          {MOCK_ORDERS.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-4 rounded-2xl border border-[hsl(var(--border))] p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium">Commande {order.number}</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {new Date(order.date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    · {order.items.length} article{order.items.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="muted">{STATUS_LABEL[order.status]}</Badge>
                <span className="font-medium tabular-nums">
                  {formatPrice(order.total, order.currencyCode)}
                </span>
                <div className="flex gap-2">
                  <Link
                    href={`/track?order=${order.number.replace("#", "")}`}
                    className="rounded-full border border-[hsl(var(--border))] px-4 py-1.5 text-sm hover:bg-[hsl(var(--muted))]"
                  >
                    Suivre
                  </Link>
                  <button
                    className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border))] px-4 py-1.5 text-sm hover:bg-[hsl(var(--muted))]"
                    aria-label="Télécharger la facture"
                  >
                    <Download className="h-4 w-4" /> Facture
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
