"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
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
              <div className="max-w-2xl">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Aucun avis pour le moment sur ce produit.
                </p>
              </div>
            )}

            {tab === "FAQ" && (
              <div className="max-w-2xl space-y-3">
                {[
                  ["Quels sont les délais de livraison ?", "En général sous 24 à 72h ouvrées à Dakar. Contactez-nous pour une livraison en dehors de Dakar."],
                  ["Comment retourner ou échanger un article ?", "En cas de défaut constaté à la réception, contactez-nous sous 48h : nous organisons l'échange ou le remboursement selon l'état du produit."],
                  ["Cet équipement est-il certifié ?", "Oui, nos EPI et équipements de sécurité incendie sont conformes aux normes EN / ISO en vigueur."],
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
