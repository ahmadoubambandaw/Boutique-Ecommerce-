"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import { motion } from "framer-motion";
import { Plus, Star } from "lucide-react";
import "swiper/css";
import type { Product } from "@/lib/shopify/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/store/cart";
import { toast } from "@/lib/store/toast";

/** Deterministic pseudo rating (4.0–5.0) so cards feel alive without a review DB. */
function ratingFor(handle: string): number {
  let h = 0;
  for (let i = 0; i < handle.length; i++) h = (h * 31 + handle.charCodeAt(i)) % 1000;
  return 4 + (h % 10) / 10;
}

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rounded
              ? "h-3.5 w-3.5 fill-amber-400 text-amber-400"
              : "h-3.5 w-3.5 text-[hsl(214_20%_80%)]"
          }
        />
      ))}
      <span className="ml-1 text-xs text-[hsl(214_18%_45%)]">{value.toFixed(1)}</span>
    </div>
  );
}

function Card({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const price = product.priceRange.minVariantPrice;
  const image = product.featuredImage;

  const quickAdd = () => {
    const variant = product.variants[0];
    if (!variant) return;
    add({
      variantId: variant.id,
      handle: product.handle,
      title: product.title,
      variantTitle: variant.title,
      image: image?.url ?? null,
      price: variant.price.amount,
      currencyCode: variant.price.currencyCode,
    });
    toast.success("Ajouté au panier", "/cart");
  };

  return (
    <div className="group h-full rounded-3xl border border-[hsl(214_20%_92%)] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[hsl(214_40%_30%)]/10">
      <Link href={`/products/${product.handle}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[hsl(214_30%_97%)]">
          {image && (
            <Image
              src={image.url}
              alt={image.altText ?? product.title}
              fill
              sizes="(max-width: 640px) 70vw, (max-width: 1024px) 33vw, 22vw"
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </div>
        <div className="mt-4 space-y-1.5">
          <p className="text-[11px] uppercase tracking-wider text-[hsl(214_18%_50%)]">
            {product.vendor || "GSE"}
          </p>
          <h3 className="line-clamp-1 font-semibold text-[hsl(214_60%_14%)]">
            {product.title}
          </h3>
          <Stars value={ratingFor(product.handle)} />
        </div>
      </Link>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-lg font-bold tabular-nums text-[hsl(214_60%_14%)]">
          {formatPrice(price.amount, price.currencyCode)}
        </span>
        <motion.button
          onClick={quickAdd}
          whileTap={{ scale: 0.9 }}
          aria-label="Ajouter au panier"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-lg shadow-[hsl(214_60%_20%)]/25 transition-transform hover:scale-110"
        >
          <Plus className="h-5 w-5" />
        </motion.button>
      </div>
    </div>
  );
}

export function FeaturedSlider({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--brand-red))]">
            Sélection
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[hsl(214_60%_14%)] sm:text-3xl">
            Produits vedettes
          </h2>
        </div>
        <Link
          href="/products"
          className="hidden text-sm font-medium text-[hsl(var(--accent))] hover:underline sm:block"
        >
          Tout voir →
        </Link>
      </div>

      <Swiper
        modules={[FreeMode]}
        freeMode
        grabCursor
        spaceBetween={16}
        slidesPerView={1.2}
        breakpoints={{
          640: { slidesPerView: 2.2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        className="!overflow-visible"
      >
        {products.map((p) => (
          <SwiperSlide key={p.id} className="h-auto self-stretch">
            <Card product={p} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
