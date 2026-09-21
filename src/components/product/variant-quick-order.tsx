"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import type { Product } from "@/lib/shopify/types";
import { useCart } from "@/lib/store/cart";
import { toast } from "@/lib/store/toast";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

/**
 * B2B bulk picker: lets a buyer set a quantity per colour/size variant (e.g.
 * 10 gilets verts + 4 orange + 70 bleus) and add them all to the cart in one
 * go, instead of repeating "choisir une couleur → ajouter → recommencer" for
 * every variant.
 */
export function VariantQuickOrder({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const available = product.variants.filter((v) => v.availableForSale);
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});

  if (available.length < 2) return null;

  function setQty(id: string, qty: number) {
    setQuantities((q) => ({ ...q, [id]: Math.max(0, qty) }));
  }

  const totalQuantity = Object.values(quantities).reduce((n, q) => n + q, 0);
  const totalPrice = available.reduce(
    (n, v) => n + parseFloat(v.price.amount) * (quantities[v.id] ?? 0),
    0,
  );
  const currency = available[0]?.price.currencyCode ?? "XOF";

  function addAll() {
    let count = 0;
    for (const v of available) {
      const qty = quantities[v.id] ?? 0;
      if (qty <= 0) continue;
      add(
        {
          variantId: v.id,
          handle: product.handle,
          title: product.title,
          variantTitle: v.title,
          image: v.image?.url ?? product.featuredImage?.url ?? null,
          price: v.price.amount,
          currencyCode: v.price.currencyCode,
        },
        qty,
      );
      count += 1;
    }
    if (count === 0) return;
    toast.success(
      `${count} variante${count > 1 ? "s" : ""} ajoutée${count > 1 ? "s" : ""} au panier`,
      "/cart",
    );
    setQuantities({});
  }

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] p-5">
      <h3 className="mb-1 font-semibold">Commander plusieurs couleurs / tailles</h3>
      <p className="mb-4 text-sm text-[hsl(var(--muted-foreground))]">
        Choisissez une quantité pour chaque variante — elles seront ajoutées
        ensemble au panier.
      </p>
      <ul className="divide-y divide-[hsl(var(--border))]">
        {available.map((v) => {
          const qty = quantities[v.id] ?? 0;
          return (
            <li key={v.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{v.title}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {formatPrice(v.price.amount, v.price.currencyCode)}
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setQty(v.id, qty - 1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
                  aria-label={`Diminuer ${v.title}`}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <input
                  type="number"
                  min={0}
                  value={qty}
                  onChange={(e) => setQty(v.id, parseInt(e.target.value, 10) || 0)}
                  className="w-12 bg-transparent text-center text-sm tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setQty(v.id, qty + 1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
                  aria-label={`Augmenter ${v.title}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--border))] pt-4 text-sm">
        <span className="text-[hsl(var(--muted-foreground))]">
          {totalQuantity} article{totalQuantity > 1 ? "s" : ""}
        </span>
        <span className="font-semibold tabular-nums">
          {formatPrice(totalPrice, currency)}
        </span>
      </div>
      <Button className="mt-3 w-full" onClick={addAll} disabled={totalQuantity === 0}>
        Ajouter tout au panier
      </Button>
    </div>
  );
}
