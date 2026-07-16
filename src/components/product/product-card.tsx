"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Plus } from "lucide-react";
import type { Product } from "@/lib/shopify/types";
import { cn, discountPercent } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { useWishlist } from "@/lib/store/wishlist";
import { useCart } from "@/lib/store/cart";
import { toast } from "@/lib/store/toast";
import { useT } from "@/lib/store/locale";

export function ProductCard({
  product,
  index = 0,
  priority = false,
}: {
  product: Product;
  index?: number;
  priority?: boolean;
}) {
  const wishlist = useWishlist();
  const addToCart = useCart((s) => s.add);
  const { t } = useT();
  const inWishlist = wishlist.items.some((i) => i.handle === product.handle);

  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange.minVariantPrice;
  const discount = discountPercent(compareAt.amount, price.amount);
  const isNew = product.tags.includes("nouveaute");
  const image = product.featuredImage;
  const hoverImage = product.images[1] ?? product.featuredImage;

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const variant = product.variants[0];
    if (!variant) return;
    addToCart({
      variantId: variant.id,
      handle: product.handle,
      title: product.title,
      variantTitle: variant.title,
      image: image?.url ?? null,
      price: variant.price.amount,
      currencyCode: variant.price.currencyCode,
    });
    toast.success(t("toast.addedToCart"), "/cart");
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    const wasIn = inWishlist;
    wishlist.toggle({
      handle: product.handle,
      title: product.title,
      image: image?.url ?? null,
      price: price.amount,
      currencyCode: price.currencyCode,
    });
    toast.info(
      wasIn ? t("toast.removedFromWishlist") : t("toast.addedToWishlist"),
      wasIn ? undefined : "/wishlist",
    );
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <Link href={`/products/${product.handle}`} className="block">
        <div className="lift relative aspect-[4/5] overflow-hidden rounded-2xl bg-[hsl(var(--muted))]">
          {image && (
            <Image
              src={image.url}
              alt={image.altText ?? product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              className="object-cover transition-opacity duration-500 group-hover:opacity-0"
            />
          )}
          {hoverImage && (
            <Image
              src={hoverImage.url}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="scale-105 object-cover opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100"
            />
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {discount && <Badge variant="sale">-{discount}%</Badge>}
            {isNew && <Badge variant="outline" className="glass">Nouveau</Badge>}
            {!product.availableForSale && (
              <Badge variant="muted">Épuisé</Badge>
            )}
          </div>

          <button
            onClick={toggleWishlist}
            aria-label="Ajouter aux favoris"
            className="glass absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                inWishlist && "fill-red-500 text-red-500",
              )}
            />
          </button>

          <button
            onClick={quickAdd}
            className="glass-strong absolute inset-x-3 bottom-3 flex translate-y-4 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Plus className="h-4 w-4" /> Ajout rapide
          </button>
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
            {product.vendor}
          </p>
          <h3 className="line-clamp-1 font-medium">{product.title}</h3>
          <div className="flex items-center gap-2">
            <Price
              amount={price.amount}
              baseCurrency={price.currencyCode}
              className="font-medium tabular-nums"
            />
            {discount && (
              <Price
                amount={compareAt.amount}
                baseCurrency={compareAt.currencyCode}
                className="text-sm text-[hsl(var(--muted-foreground))] line-through tabular-nums"
              />
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
