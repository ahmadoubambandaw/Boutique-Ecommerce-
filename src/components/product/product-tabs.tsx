"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import type { Product } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

const TABS = ["Description", "Spécifications", "Avis", "FAQ"] as const;
type Tab = (typeof TABS)[number];

export function ProductTabs({ product }: { product: Product }) {
  const [tab, setTab] = React.useState<Tab>("Description");

  return (
    <div className="mt-20">
      <div className="flex gap-1 overflow-x-auto border-b border-[hsl(var(--border))] no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "relative shrink-0 px-5 py-3 text-sm font-medium transition-colors",
              tab === t
                ? "text-[hsl(var(--foreground))]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
            )}
          >
            {t}
            {tab === t && (
              <motion.span
                layoutId="tab-underline"
                className="absolute inset-x-0 -bottom-px h-0.5 bg-[hsl(var(--accent))]"
              />
            )}
          </button>
        ))}
      </div>

      <div className="py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "Description" && (
              <div
                className="prose-sm max-w-2xl text-[hsl(var(--muted-foreground))] [&_li]:my-1 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            )}

            {tab === "Spécifications" && (
              <dl className="max-w-lg divide-y divide-[hsl(var(--border))]">
                {[
                  ["Marque", product.vendor],
                  ["Catégorie", product.productType || "—"],
                  ["Référence", product.id.split("/").pop()],
                  ["Disponibilité", product.availableForSale ? "En stock" : "Épuisé"],
                  ["Options", product.options.map((o) => o.name).join(", ") || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-3 text-sm">
                    <dt className="text-[hsl(var(--muted-foreground))]">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {tab === "Avis" && (
              <div className="max-w-2xl space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-5 w-5",
                          i < 4
                            ? "fill-amber-400 text-amber-400"
                            : "text-[hsl(var(--border))]",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    4,6 / 5 · 128 avis vérifiés
                  </span>
                </div>
                {[
                  { name: "Camille", text: "Qualité irréprochable, coupe parfaite. Je recommande !" },
                  { name: "Thomas", text: "Livraison rapide et produit conforme. Très satisfait." },
                ].map((r) => (
                  <div key={r.name} className="rounded-2xl border border-[hsl(var(--border))] p-4">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-medium">{r.name}</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        Achat vérifié
                      </span>
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{r.text}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === "FAQ" && (
              <div className="max-w-2xl space-y-3">
                {[
                  ["Quels sont les délais de livraison ?", "2 à 4 jours ouvrés en France métropolitaine."],
                  ["Comment retourner un article ?", "Retours gratuits sous 30 jours via votre espace client."],
                  ["Les tailles sont-elles conformes ?", "Oui, consultez le guide des tailles sur la fiche produit."],
                ].map(([q, a]) => (
                  <details
                    key={q}
                    className="group rounded-2xl border border-[hsl(var(--border))] p-4"
                  >
                    <summary className="cursor-pointer list-none font-medium">
                      {q}
                    </summary>
                    <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                      {a}
                    </p>
                  </details>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
