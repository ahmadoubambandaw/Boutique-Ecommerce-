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
}: {
  collection: Collection;
  index?: number;
  large?: boolean;
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
        <div className={large ? "aspect-square sm:aspect-auto sm:h-full" : "aspect-[4/3]"}>
          {collection.image && (
            <Image
              src={collection.image.url}
              alt={collection.image.altText ?? collection.title}
              fill
              sizes={large ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 100vw, 25vw"}
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white">
          <div>
            <h3 className="text-xl font-semibold sm:text-2xl">{collection.title}</h3>
            {large && collection.description && (
              <p className="mt-1 max-w-xs text-sm text-white/80">
                {collection.description}
              </p>
            )}
          </div>
          <span className="glass inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition-transform group-hover:rotate-45">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
