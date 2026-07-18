import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Package, Phone, Smartphone, Truck } from "lucide-react";
import { getOrder } from "@/lib/commerce/repository";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente de confirmation",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const isMobileMoney = order.paymentMethod === "mobile_money";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Merci, {order.address.fullName.split(" ")[0]} !
        </h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">
          Votre commande <strong>#{order.orderNumber}</strong> a bien été
          enregistrée. Nous vous contactons rapidement au {order.address.phone}{" "}
          pour la confirmer.
        </p>
      </div>

      {/* Payment instructions */}
      <div className="mt-8 rounded-2xl border border-[hsl(var(--border))] p-5">
        <div className="flex items-start gap-3">
          {isMobileMoney ? (
            <Smartphone className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <Truck className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <div>
            <p className="font-medium">
              {isMobileMoney
                ? "Paiement par mobile money"
                : "Paiement à la livraison"}
            </p>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              {isMobileMoney
                ? "Nous vous enverrons le numéro Wave / Orange Money pour régler votre commande après confirmation par téléphone."
                : "Vous réglez en espèces au moment de la réception de votre commande."}
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] p-5">
        <Package className="h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Statut</p>
          <p className="font-medium">
            {STATUS_LABEL[order.status] ?? order.status}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="mt-6 rounded-2xl border border-[hsl(var(--border))] p-6">
        <h2 className="mb-4 text-lg font-semibold">Détail de la commande</h2>
        <ul className="space-y-4">
          {order.items.map((item, i) => (
            <li key={`${item.productId}-${i}`} className="flex gap-4">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-[hsl(var(--muted))]">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {item.variantTitle} × {item.quantity}
                </p>
              </div>
              <span className="tabular-nums">
                {formatPrice(item.price * item.quantity, order.currency)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-6 space-y-2 border-t border-[hsl(var(--border))] pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-[hsl(var(--muted-foreground))]">Sous-total</dt>
            <dd className="tabular-nums">
              {formatPrice(order.subtotal, order.currency)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[hsl(var(--muted-foreground))]">Livraison</dt>
            <dd className="tabular-nums">
              {order.deliveryFee === 0
                ? "Offerte"
                : formatPrice(order.deliveryFee, order.currency)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-[hsl(var(--border))] pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">
              {formatPrice(order.total, order.currency)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Delivery address */}
      <div className="mt-6 rounded-2xl border border-[hsl(var(--border))] p-6">
        <h2 className="mb-3 text-lg font-semibold">Adresse de livraison</h2>
        <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
          {order.address.fullName}
          <br />
          {order.address.address}
          <br />
          {order.address.city}
          {order.address.region ? `, ${order.address.region}` : ""}
          <br />
          {order.address.country}
        </p>
        <p className="mt-2 flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4" /> {order.address.phone}
        </p>
        {order.address.note && (
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Note : {order.address.note}
          </p>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/products"
          className="inline-flex h-11 items-center rounded-full bg-[hsl(var(--accent))] px-6 text-sm font-medium text-[hsl(var(--accent-foreground))] transition-opacity hover:opacity-90"
        >
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}
