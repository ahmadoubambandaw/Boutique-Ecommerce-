"use client";

import Image from "next/image";
import Link from "next/link";
import { useRecentlyViewed } from "@/lib/store/recently-viewed";
import { formatPrice } from "@/lib/utils";
import { SectionHeader } from "@/components/ui/section-header";

/** Product rail fed by the client's browsing history (localStorage). */
export function RecentlyViewed() {
  const items = useRecentlyViewed((s) => s.items);
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Reprendre" title="Vus récemment" />
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {items.map((item) => (
          <Link
            key={item.handle}
            href={`/products/${item.handle}`}
            className="group w-44 shrink-0"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[hsl(var(--muted))]">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="176px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <p className="mt-2 line-clamp-1 text-sm font-medium">{item.title}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {formatPrice(item.price, item.currencyCode)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
