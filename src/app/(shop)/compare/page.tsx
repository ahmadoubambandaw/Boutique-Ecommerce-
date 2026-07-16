"use client";

import Image from "next/image";
import Link from "next/link";
import { Scale, X } from "lucide-react";
import { useCompare } from "@/lib/store/compare";
import { formatPrice } from "@/lib/utils";

export default function ComparePage() {
  const { items, remove, clear } = useCompare();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-32 text-center">
        <Scale className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
        <h1 className="text-2xl font-semibold">Aucun produit à comparer</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Ajoutez des produits au comparateur depuis leur fiche.
        </p>
        <Link
          href="/products"
          className="inline-flex h-11 items-center rounded-full bg-[hsl(var(--accent))] px-6 text-sm font-medium text-[hsl(var(--accent-foreground))]"
        >
          Explorer le catalogue
        </Link>
      </div>
    );
  }

  const rows: { label: string; get: (i: (typeof items)[number]) => string }[] = [
    { label: "Prix", get: (i) => formatPrice(i.price, i.currencyCode) },
    { label: "Marque", get: (i) => i.vendor },
    { label: "Catégorie", get: (i) => i.productType || "—" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Comparateur
        </h1>
        <button
          onClick={clear}
          className="text-sm text-[hsl(var(--muted-foreground))] underline hover:text-[hsl(var(--foreground))]"
        >
          Tout effacer
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className="w-32" />
              {items.map((item) => (
                <th key={item.handle} className="p-3 align-top">
                  <div className="relative mx-auto aspect-[4/5] w-full max-w-[180px] overflow-hidden rounded-2xl bg-[hsl(var(--muted))]">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="180px"
                        className="object-cover"
                      />
                    )}
                    <button
                      onClick={() => remove(item.handle)}
                      className="glass absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full"
                      aria-label="Retirer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <Link
                    href={`/products/${item.handle}`}
                    className="mt-2 block text-center text-sm font-medium hover:underline"
                  >
                    {item.title}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-[hsl(var(--border))]">
                <td className="p-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  {row.label}
                </td>
                {items.map((item) => (
                  <td key={item.handle} className="p-3 text-center text-sm">
                    {row.get(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
