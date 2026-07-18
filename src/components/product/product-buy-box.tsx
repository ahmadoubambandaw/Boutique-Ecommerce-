"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Heart, Minus, Plus, Scale, Share2, Truck } from "lucide-react";
import type { Product, ProductVariant } from "@/lib/shopify/types";
import { cn, discountPercent } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { useCart } from "@/lib/store/cart";
import { useWishlist } from "@/lib/store/wishlist";
import { useCompare } from "@/lib/store/compare";
import { useRecentlyViewed } from "@/lib/store/recently-viewed";
import { startCheckoutAction } from "@/lib/actions/checkout";
import { toast } from "@/lib/store/toast";

function matchVariant(
  product: Product,
  selected: Record<string, string>,
): ProductVariant | undefined {
  return product.variants.find((v) =>
    v.selectedOptions.every((o) => selected[o.name] === o.value),
  );
}

export function ProductBuyBox({ product }: { product: Product }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const wishlist = useWishlist();
  const compare = useCompare();
  const trackViewed = useRecentlyViewed((s) => s.add);

  const [selected, setSelected] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(
      product.options.map((o) => [o.name, o.values[0] ?? ""]),
    ),
  );
  const [quantity, setQuantity] = React.useState(1);
  const [pending, setPending] = React.useState(false);
  const [shared, setShared] = React.useState(false);

  const variant = matchVariant(product, selected) ?? product.variants[0];
  const price = variant?.price ?? product.priceRange.minVariantPrice;
  const compareAt = variant?.compareAtPrice ?? null;
  const discount = discountPercent(compareAt?.amount, price.amount);
  const available = variant?.availableForSale ?? product.availableForSale;
  const inWishlist = wishlist.items.some((i) => i.handle === product.handle);
  const inCompare = compare.items.some((i) => i.handle === product.handle);

  // Record as recently viewed on mount.
  React.useEffect(() => {
    trackViewed({
      handle: product.handle,
      title: product.title,
      image: product.featuredImage?.url ?? null,
      price: product.priceRange.minVariantPrice.amount,
      currencyCode: product.priceRange.minVariantPrice.currencyCode,
    });
  }, [product, trackViewed]);

  const addToCart = () => {
    if (!variant) return;
    add(
      {
        variantId: variant.id,
        handle: product.handle,
        title: product.title,
        variantTitle: variant.title,
        image: product.featuredImage?.url ?? null,
        price: variant.price.amount,
        currencyCode: variant.price.currencyCode,
      },
      quantity,
    );
    toast.success("Ajouté au panier", "/cart");
  };

  const buyNow = async () => {
    if (!variant) return;
    // Local-checkout mode (Wave / Orange Money / COD) → custom checkout page.
    if (process.env.NEXT_PUBLIC_CHECKOUT_MODE === "local") {
      addToCart();
      router.push("/checkout");
      return;
    }
    setPending(true);
    const res = await startCheckoutAction([
      { variantId: variant.id, quantity },
    ]);
    if (res.ok && res.checkoutUrl) {
      window.location.href = res.checkoutUrl;
      return;
    }
    // Demo fallback: add to cart and open cart drawer.
    addToCart();
    setPending(false);
  };

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      await navigator.share({ title: product.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          {product.vendor}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          {product.title}
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <Price
            amount={price.amount}
            baseCurrency={price.currencyCode}
            className="text-2xl font-semibold tabular-nums"
          />
          {compareAt && discount && (
            <>
              <Price
                amount={compareAt.amount}
                baseCurrency={compareAt.currencyCode}
                className="text-lg text-[hsl(var(--muted-foreground))] line-through tabular-nums"
              />
              <Badge variant="sale">-{discount}%</Badge>
            </>
          )}
        </div>
      </div>

      {/* Options */}
      {product.options
        .filter((o) => o.values.length > 1 || o.values[0] !== "Unique")
        .map((option) => (
          <div key={option.id}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">{option.name}</span>
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                {selected[option.name]}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isColor = /couleur|color/i.test(option.name);
                const isSelected = selected[option.name] === value;
                return (
                  <button
                    key={value}
                    onClick={() =>
                      setSelected((s) => ({ ...s, [option.name]: value }))
                    }
                    className={cn(
                      "min-w-11 rounded-full border px-4 py-2 text-sm transition-all",
                      isSelected
                        ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                        : "border-[hsl(var(--border))] hover:border-[hsl(var(--foreground))]",
                    )}
                  >
                    {isColor ? `● ${value}` : value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

      {/* Availability */}
      <div className="flex items-center gap-2 text-sm">
        {available ? (
          <>
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span>
              En stock
              {variant?.quantityAvailable
                ? ` · ${variant.quantityAvailable} disponibles`
                : ""}
            </span>
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>Épuisé</span>
          </>
        )}
      </div>

      {/* Quantity + actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-[hsl(var(--border))]">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
            aria-label="Diminuer la quantité"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center tabular-nums">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
            aria-label="Augmenter la quantité"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button
          className="flex-1"
          size="lg"
          onClick={addToCart}
          disabled={!available}
        >
          Ajouter au panier
        </Button>
      </div>

      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={buyNow}
        disabled={!available || pending}
      >
        {pending ? "Redirection…" : "Acheter maintenant"}
      </Button>

      {/* Secondary actions */}
      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={() =>
            wishlist.toggle({
              handle: product.handle,
              title: product.title,
              image: product.featuredImage?.url ?? null,
              price: price.amount,
              currencyCode: price.currencyCode,
            })
          }
          className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <Heart className={cn("h-4 w-4", inWishlist && "fill-red-500 text-red-500")} />
          {inWishlist ? "Dans les favoris" : "Ajouter aux favoris"}
        </button>
        <button
          onClick={() =>
            compare.toggle({
              handle: product.handle,
              title: product.title,
              image: product.featuredImage?.url ?? null,
              price: price.amount,
              currencyCode: price.currencyCode,
              vendor: product.vendor,
              productType: product.productType,
            })
          }
          className={cn(
            "inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
            inCompare && "text-[hsl(var(--foreground))]",
          )}
        >
          <Scale className="h-4 w-4" /> Comparer
        </button>
        <button
          onClick={share}
          className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          {shared ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          {shared ? "Lien copié" : "Partager"}
        </button>
      </div>

      {/* Reassurance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] p-4 text-sm text-[hsl(var(--muted-foreground))]"
      >
        <Truck className="h-5 w-5 shrink-0" />
        Livraison offerte dès 50€ · Retours gratuits sous 30 jours
      </motion.div>
    </div>
  );
}
