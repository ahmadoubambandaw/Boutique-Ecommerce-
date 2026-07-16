"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/lib/shopify/types";
import { ProductGrid } from "@/components/product/product-grid";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "latest", label: "Nouveautés" },
  { value: "popular", label: "Populaire" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
];

export function CatalogView({
  products,
  title,
}: {
  products: Product[];
  title: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "latest";

  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [selectedColors, setSelectedColors] = React.useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = React.useState<string[]>([]);
  const [maxPrice, setMaxPrice] = React.useState<number | null>(null);
  const [onlyAvailable, setOnlyAvailable] = React.useState(false);

  // Facets derived from the current product set.
  const facets = React.useMemo(() => {
    const colors = new Set<string>();
    const vendors = new Set<string>();
    let priceMax = 0;
    for (const p of products) {
      vendors.add(p.vendor);
      priceMax = Math.max(priceMax, parseFloat(p.priceRange.maxVariantPrice.amount));
      for (const o of p.options) {
        if (/couleur|color/i.test(o.name)) o.values.forEach((v) => colors.add(v));
      }
    }
    return {
      colors: [...colors],
      vendors: [...vendors],
      priceMax: Math.ceil(priceMax),
    };
  }, [products]);

  const filtered = React.useMemo(() => {
    return products.filter((p) => {
      if (onlyAvailable && !p.availableForSale) return false;
      if (selectedVendors.length && !selectedVendors.includes(p.vendor))
        return false;
      if (maxPrice !== null) {
        if (parseFloat(p.priceRange.minVariantPrice.amount) > maxPrice)
          return false;
      }
      if (selectedColors.length) {
        const colors = p.options
          .filter((o) => /couleur|color/i.test(o.name))
          .flatMap((o) => o.values);
        if (!selectedColors.some((c) => colors.includes(c))) return false;
      }
      return true;
    });
  }, [products, onlyAvailable, selectedVendors, maxPrice, selectedColors]);

  const setSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggle = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
  ) =>
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );

  const activeCount =
    selectedColors.length +
    selectedVendors.length +
    (maxPrice !== null ? 1 : 0) +
    (onlyAvailable ? 1 : 0);

  const FiltersPanel = (
    <div className="space-y-8">
      {/* Availability */}
      <label className="flex cursor-pointer items-center justify-between">
        <span className="text-sm font-medium">Disponible uniquement</span>
        <input
          type="checkbox"
          checked={onlyAvailable}
          onChange={(e) => setOnlyAvailable(e.target.checked)}
          className="h-4 w-4 accent-[hsl(var(--accent))]"
        />
      </label>

      {/* Price */}
      <div>
        <p className="mb-3 text-sm font-medium">
          Prix max : {maxPrice ?? facets.priceMax} €
        </p>
        <input
          type="range"
          min={0}
          max={facets.priceMax}
          value={maxPrice ?? facets.priceMax}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[hsl(var(--accent))]"
        />
      </div>

      {/* Colors */}
      {facets.colors.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium">Couleur</p>
          <div className="flex flex-wrap gap-2">
            {facets.colors.map((c) => (
              <button
                key={c}
                onClick={() => toggle(setSelectedColors, c)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  selectedColors.includes(c)
                    ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                    : "border-[hsl(var(--border))] hover:border-[hsl(var(--foreground))]",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Vendors */}
      {facets.vendors.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium">Marque</p>
          <div className="space-y-2">
            {facets.vendors.map((v) => (
              <label key={v} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedVendors.includes(v)}
                  onChange={() => toggle(setSelectedVendors, v)}
                  className="h-4 w-4 accent-[hsl(var(--accent))]"
                />
                {v}
              </label>
            ))}
          </div>
        </div>
      )}

      {activeCount > 0 && (
        <button
          onClick={() => {
            setSelectedColors([]);
            setSelectedVendors([]);
            setMaxPrice(null);
            setOnlyAvailable(false);
          }}
          className="text-sm text-[hsl(var(--muted-foreground))] underline hover:text-[hsl(var(--foreground))]"
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {filtered.length} produit{filtered.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-4 py-2 text-sm lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
            {activeCount > 0 && (
              <span className="rounded-full bg-[hsl(var(--accent))] px-1.5 text-xs text-[hsl(var(--accent-foreground))]">
                {activeCount}
              </span>
            )}
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm"
            aria-label="Trier"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{FiltersPanel}</div>
        </aside>
        <ProductGrid products={filtered} />
      </div>

      {/* Mobile filters drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="glass-strong absolute inset-y-0 right-0 w-80 max-w-[85%] overflow-y-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-semibold">Filtres</span>
              <button
                onClick={() => setFiltersOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {FiltersPanel}
          </div>
        </div>
      )}
    </div>
  );
}
