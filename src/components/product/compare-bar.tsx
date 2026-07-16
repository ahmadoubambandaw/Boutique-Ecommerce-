"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCompare } from "@/lib/store/compare";

/** Floating bar that collects products selected for comparison. */
export function CompareBar() {
  const { items, remove, clear } = useCompare();

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-x-0 bottom-4 z-40 mx-auto flex max-w-3xl items-center gap-4 px-4"
        >
          <div className="glass-strong flex w-full items-center gap-4 rounded-2xl border border-[hsl(var(--border))] p-3 shadow-2xl">
            <span className="hidden shrink-0 text-sm font-medium sm:block">
              Comparer
            </span>
            <div className="flex flex-1 gap-2 overflow-x-auto no-scrollbar">
              {items.map((item) => (
                <div
                  key={item.handle}
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[hsl(var(--muted))]"
                >
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                  <button
                    onClick={() => remove(item.handle)}
                    className="absolute right-0.5 top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white"
                    aria-label="Retirer de la comparaison"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
            <Link
              href="/compare"
              className="shrink-0 rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-sm font-medium text-[hsl(var(--accent-foreground))]"
            >
              Comparer ({items.length})
            </Link>
            <button
              onClick={clear}
              className="shrink-0 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              Effacer
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
