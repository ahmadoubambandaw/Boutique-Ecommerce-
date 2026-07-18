import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Package, Phone, Smartphone, Truck } from "lucide-react";
import { getOrder } from "@/lib/commerce/repository";
import { formatPrice } from "@/lib/utils";
import { CONTACT, MOBILE_MONEY_NUMBER } from "@/lib/contact";
import type { Order } from "@/lib/commerce/types";

/** Build a WhatsApp message summarising the order for the merchant. */
function whatsappOrderLink(order: Order): string {
  const lines = order.items.map(
    (i) =>
      `• ${i.title}${
        i.variantTitle && i.variantTitle !== "Default Title"
          ? ` (${i.variantTitle})`
          : ""
      } × ${i.quantity} — ${formatPrice(i.price * i.quantity, order.currency)}`,
  );
  const a = order.address;
  const msg = [
    `Bonjour GSE, je confirme ma commande #${order.orderNumber} :`,
    "",
    ...lines,
    "",
    `Sous-total : ${formatPrice(order.subtotal, order.currency)}`,
    `Livraison : ${order.deliveryFee === 0 ? "Offerte" : formatPrice(order.deliveryFee, order.currency)}`,
    `Total : ${formatPrice(order.total, order.currency)}`,
    `Paiement : ${order.paymentMethod === "mobile_money" ? "Wave / Orange Money" : "À la livraison"}`,
    "",
    `Nom : ${a.fullName}`,
    `Tél : ${a.phone}`,
    `Adresse : ${a.address}, ${a.city}${a.region ? `, ${a.region}` : ""}, ${a.country}`,
    ...(a.note ? [`Note : ${a.note}`] : []),
  ].join("\n");
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}

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

      {/* WhatsApp confirmation — sends the order straight to the merchant */}
      <a
        href={whatsappOrderLink(order)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-4 text-center text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.01]"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Envoyer ma commande sur WhatsApp
      </a>
      <p className="mt-2 text-center text-xs text-[hsl(var(--muted-foreground))]">
        Recommandé — pour une confirmation et un traitement plus rapides.
      </p>

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
                ? `Réglez votre commande via Wave / Orange Money au ${MOBILE_MONEY_NUMBER}. Nous confirmons par téléphone avant la livraison.`
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
