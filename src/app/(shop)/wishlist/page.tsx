"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, X } from "lucide-react";
import { useWishlist } from "@/lib/store/wishlist";
import { useCart } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { items, remove } = useWishlist();
  const addToCart = useCart((s) => s.add);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight sm:text-4xl">
        Mes favoris
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <Heart className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
          <p className="text-[hsl(var(--muted-foreground))]">
            Votre liste de favoris est vide.
          </p>
          <Link
            href="/products"
            className="inline-flex h-11 items-center rounded-full bg-[hsl(var(--accent))] px-6 text-sm font-medium text-[hsl(var(--accent-foreground))]"
          >
            Explorer le catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <div key={item.handle} className="group relative">
              <Link href={`/products/${item.handle}`}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[hsl(var(--muted))]">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
              </Link>
              <button
                onClick={() => remove(item.handle)}
                className="glass absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full"
                aria-label="Retirer des favoris"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="mt-3">
                <h3 className="line-clamp-1 font-medium">{item.title}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {formatPrice(item.price, item.currencyCode)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
