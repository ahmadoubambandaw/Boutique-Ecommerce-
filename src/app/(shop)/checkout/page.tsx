"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Banknote, Smartphone, Truck } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { formatPrice, cn } from "@/lib/utils";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { placeOrderAction } from "@/lib/actions/order";
import { DELIVERY_FEE, FREE_DELIVERY_ABOVE } from "@/lib/commerce/shipping";
import type { PaymentMethod } from "@/lib/commerce/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, clear } = useCart();
  const [payment, setPayment] = React.useState<PaymentMethod>("cod");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const subtotal = lines.reduce(
    (n, l) => n + parseFloat(l.price) * l.quantity,
    0,
  );
  const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;
  const currency = lines[0]?.currencyCode ?? "XOF";

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-32 text-center">
        <h1 className="text-2xl font-semibold">Votre panier est vide</h1>
        <Link
          href="/products"
          className="inline-flex h-11 items-center rounded-full bg-[hsl(var(--accent))] px-6 text-sm font-medium text-[hsl(var(--accent-foreground))]"
        >
          Voir les produits
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const items = lines.map((l) => ({
      productId: l.handle,
      handle: l.handle,
      title: l.title,
      variantTitle: l.variantTitle,
      price: parseFloat(l.price),
      quantity: l.quantity,
      image: l.image,
    }));

    const res = await placeOrderAction(items, {
      fullName: String(fd.get("fullName") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      address: String(fd.get("address") ?? ""),
      city: String(fd.get("city") ?? ""),
      region: String(fd.get("region") ?? ""),
      note: String(fd.get("note") ?? ""),
      paymentMethod: payment,
    });

    setPending(false);
    if (res.ok && res.orderId) {
      clear();
      router.push(`/commande/${res.orderId}`);
    } else {
      setError(res.error ?? "Une erreur est survenue.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Commande</h1>
      <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Left: address + payment */}
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Coordonnées & livraison</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">Nom complet</label>
                <Input name="fullName" required placeholder="Ex. Awa Ndiaye" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Téléphone</label>
                <Input name="phone" required placeholder="+221 77 000 00 00" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">E-mail (optionnel)</label>
                <Input name="email" type="email" placeholder="vous@exemple.com" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">Adresse</label>
                <Input name="address" required placeholder="Quartier, rue, repère…" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Ville</label>
                <Input name="city" required placeholder="Dakar" defaultValue="Dakar" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Région (optionnel)</label>
                <Input name="region" placeholder="Dakar" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">Note (optionnel)</label>
                <Textarea name="note" placeholder="Instructions de livraison…" className="min-h-20" />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Paiement</h2>
            <button
              type="button"
              onClick={() => setPayment("cod")}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors",
                payment === "cod"
                  ? "border-[hsl(var(--accent))] bg-[hsl(var(--muted))]"
                  : "border-[hsl(var(--border))]",
              )}
            >
              <Banknote className="h-5 w-5" />
              <div>
                <p className="font-medium">Paiement à la livraison</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Payez en espèces à la réception de votre commande.
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setPayment("mobile_money")}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors",
                payment === "mobile_money"
                  ? "border-[hsl(var(--accent))] bg-[hsl(var(--muted))]"
                  : "border-[hsl(var(--border))]",
              )}
            >
              <Smartphone className="h-5 w-5" />
              <div>
                <p className="font-medium">Wave / Orange Money</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Nous vous envoyons le numéro pour payer après validation.
                </p>
              </div>
            </button>
          </section>
        </div>

        {/* Right: summary */}
        <aside className="h-fit rounded-3xl border border-[hsl(var(--border))] p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-lg font-semibold">Votre commande</h2>
          <ul className="space-y-3">
            {lines.map((l) => (
              <li key={l.variantId} className="flex gap-3">
                <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-[hsl(var(--muted))]">
                  {l.image && (
                    <Image src={l.image} alt={l.title} fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.title}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {l.variantTitle} × {l.quantity}
                  </p>
                </div>
                <span className="text-sm tabular-nums">
                  {formatPrice(parseFloat(l.price) * l.quantity, l.currencyCode)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-[hsl(var(--border))] pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">Sous-total</dt>
              <dd className="tabular-nums">{formatPrice(subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
                <Truck className="h-4 w-4" /> Livraison
              </dt>
              <dd className="tabular-nums">
                {deliveryFee === 0 ? "Offerte" : formatPrice(deliveryFee, currency)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-[hsl(var(--border))] pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(total, currency)}</dd>
            </div>
          </dl>

          {error && (
            <p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-500">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-4 w-full" disabled={pending}>
            {pending ? "Validation…" : "Valider la commande"}
          </Button>
          <p className="mt-2 text-center text-xs text-[hsl(var(--muted-foreground))]">
            Aucun paiement en ligne — vous payez à la livraison ou par mobile money.
          </p>
        </aside>
      </form>
    </div>
  );
}
