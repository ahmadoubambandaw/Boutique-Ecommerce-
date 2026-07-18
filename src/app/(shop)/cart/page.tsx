"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DELIVERY_FEE, FREE_DELIVERY_ABOVE } from "@/lib/commerce/shipping";

export default function CartPage() {
  const router = useRouter();
  const { lines, updateQuantity, remove } = useCart();
  const [promo, setPromo] = React.useState("");

  const subtotal = lines.reduce(
    (n, l) => n + parseFloat(l.price) * l.quantity,
    0,
  );
  const currency = lines[0]?.currencyCode ?? "XOF";
  const shipping =
    subtotal >= FREE_DELIVERY_ABOVE || subtotal === 0 ? 0 : DELIVERY_FEE;

  function checkout() {
    router.push("/checkout");
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-32 text-center">
        <ShoppingBag className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
        <h1 className="text-2xl font-semibold">Votre panier est vide</h1>
        <Link
          href="/products"
          className="inline-flex h-11 items-center rounded-full bg-[hsl(var(--accent))] px-6 text-sm font-medium text-[hsl(var(--accent-foreground))]"
        >
          Explorer le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight sm:text-4xl">
        Panier
      </h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y divide-[hsl(var(--border))]">
          {lines.map((line) => (
            <li key={line.variantId} className="flex gap-4 py-6">
              <Link
                href={`/products/${line.handle}`}
                className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-[hsl(var(--muted))]"
              >
                {line.image && (
                  <Image
                    src={line.image}
                    alt={line.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                )}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link href={`/products/${line.handle}`} className="font-medium">
                      {line.title}
                    </Link>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {line.variantTitle}
                    </p>
                  </div>
                  <span className="font-medium tabular-nums">
                    {formatPrice(
                      parseFloat(line.price) * line.quantity,
                      line.currencyCode,
                    )}
                  </span>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded-full border border-[hsl(var(--border))]">
                    <button
                      onClick={() => updateQuantity(line.variantId, line.quantity - 1)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
                      aria-label="Diminuer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm tabular-nums">
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(line.variantId, line.quantity + 1)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
                      aria-label="Augmenter"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => remove(line.variantId)}
                    className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" /> Retirer
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="h-fit rounded-3xl border border-[hsl(var(--border))] p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-lg font-semibold">Récapitulatif</h2>
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Code promo"
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
            />
            <Button variant="outline">Appliquer</Button>
          </div>
          <dl className="space-y-2 border-t border-[hsl(var(--border))] pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">Sous-total</dt>
              <dd className="tabular-nums">{formatPrice(subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">Livraison</dt>
              <dd className="tabular-nums">
                {shipping === 0 ? "Offerte" : formatPrice(shipping, currency)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-[hsl(var(--border))] pt-2 text-base font-semibold">
              <dt>Total estimé</dt>
              <dd className="tabular-nums">
                {formatPrice(subtotal + shipping, currency)}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
            Paiement à la livraison ou par mobile money (Wave / Orange Money).
          </p>
          <Button className="mt-4 w-full" size="lg" onClick={checkout}>
            Passer commande
          </Button>
        </aside>
      </div>
    </div>
  );
}
