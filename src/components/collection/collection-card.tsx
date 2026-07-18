"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Collection } from "@/lib/shopify/types";

export function CollectionCard({
  collection,
  index = 0,
  large = false,
  count = 0,
}: {
  collection: Collection;
  index?: number;
  large?: boolean;
  count?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={large ? "sm:col-span-2 sm:row-span-2" : ""}
    >
      <Link
        href={`/collections/${collection.handle}`}
        className="group relative block h-full overflow-hidden rounded-3xl bg-[hsl(var(--muted))]"
      >
        <div
          className={
            large
              ? "aspect-square sm:aspect-auto sm:h-full"
              : "aspect-square sm:aspect-[4/3]"
          }
        >
          {collection.image ? (
            <Image
              src={collection.image.url}
              alt={collection.image.altText ?? collection.title}
              fill
              sizes={large ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 100vw, 25vw"}
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(214_81%_22%)] via-[hsl(214_81%_16%)] to-[hsl(214_81%_10%)] transition-transform duration-700 group-hover:scale-105" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-6 text-white">
          <div>
            {count > 0 && (
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                {count} pièce{count > 1 ? "s" : ""}
              </p>
            )}
            <h3 className="mt-1 text-2xl font-semibold sm:text-2xl">
              {collection.title}
            </h3>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium uppercase tracking-wide text-white/90 transition-colors group-hover:text-white">
              Explorer
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
