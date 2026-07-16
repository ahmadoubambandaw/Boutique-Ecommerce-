"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type SearchResult = {
  products: {
    handle: string;
    title: string;
    featuredImage: { url: string; altText: string | null } | null;
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  }[];
  queries: { text: string }[];
};

const HISTORY_KEY = "boutique-search-history";

export function SearchCommand({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [history, setHistory] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      try {
        setHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"));
      } catch {
        setHistory([]);
      }
    } else {
      setQuery("");
    }
  }, [open]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChange]);

  const { data, isFetching } = useQuery<SearchResult>({
    queryKey: ["search", query],
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      return res.json();
    },
    enabled: query.trim().length > 1,
  });

  const submit = (q: string) => {
    if (!q.trim()) return;
    const next = [q, ...history.filter((h) => h !== q)].slice(0, 6);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    onOpenChange(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            className="glass-strong absolute inset-x-0 top-0 mx-auto max-w-2xl overflow-hidden rounded-b-3xl border-b border-[hsl(var(--border))] p-4 shadow-2xl sm:top-6 sm:rounded-3xl"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(query);
              }}
              className="flex items-center gap-3 border-b border-[hsl(var(--border))] pb-4"
            >
              <Search className="h-5 w-5 shrink-0 text-[hsl(var(--muted-foreground))]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un produit, une marque…"
                className="flex-1 bg-transparent text-lg outline-none placeholder:text-[hsl(var(--muted-foreground))]"
              />
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
                aria-label="Fermer la recherche"
              >
                <X className="h-4 w-4" />
              </button>
            </form>

            <div className="max-h-[60vh] overflow-y-auto pt-4">
              {query.trim().length <= 1 && history.length > 0 && (
                <div>
                  <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                    Recherches récentes
                  </p>
                  <div className="flex flex-wrap gap-2 px-2">
                    {history.map((h) => (
                      <button
                        key={h}
                        onClick={() => submit(h)}
                        className="rounded-full border border-[hsl(var(--border))] px-3 py-1.5 text-sm hover:bg-[hsl(var(--muted))]"
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isFetching && (
                <p className="px-2 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
                  Recherche…
                </p>
              )}

              {data?.products && data.products.length > 0 && (
                <ul className="flex flex-col gap-1">
                  {data.products.map((p) => (
                    <li key={p.handle}>
                      <Link
                        href={`/products/${p.handle}`}
                        onClick={() => onOpenChange(false)}
                        className="flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-[hsl(var(--muted))]"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[hsl(var(--muted))]">
                          {p.featuredImage && (
                            <Image
                              src={p.featuredImage.url}
                              alt={p.featuredImage.altText ?? p.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{p.title}</p>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            {formatPrice(
                              p.priceRange.minVariantPrice.amount,
                              p.priceRange.minVariantPrice.currencyCode,
                            )}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {query.trim().length > 1 &&
                !isFetching &&
                data?.products?.length === 0 && (
                  <p className="px-2 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
                    Aucun résultat pour « {query} »
                  </p>
                )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
