"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ShopifyImage } from "@/lib/shopify/types";

export function ProductGallery({
  images,
  title,
}: {
  images: ShopifyImage[];
  title: string;
}) {
  const [active, setActive] = React.useState(0);
  const [zoom, setZoom] = React.useState(false);
  const [origin, setOrigin] = React.useState({ x: 50, y: 50 });

  const current = images[active] ?? images[0];
  if (!current) {
    return <div className="aspect-[4/5] rounded-3xl bg-[hsl(var(--muted))]" />;
  }

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 lg:flex-col">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                i === active
                  ? "border-[hsl(var(--accent))]"
                  : "border-transparent opacity-60 hover:opacity-100",
              )}
              aria-label={`Voir l'image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `${title} ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image with hover-zoom */}
      <div className="flex-1">
        <div
          className="relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-3xl bg-[hsl(var(--muted))]"
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={onMove}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.url}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={current.url}
                alt={current.altText ?? title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-200"
                style={
                  zoom
                    ? {
                        transform: "scale(1.8)",
                        transformOrigin: `${origin.x}% ${origin.y}%`,
                      }
                    : undefined
                }
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
