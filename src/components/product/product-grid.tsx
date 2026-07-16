import type { Product } from "@/lib/shopify/types";
import { ProductCard } from "./product-card";

export function ProductGrid({
  products,
  priorityCount = 4,
}: {
  products: Product[];
  priorityCount?: number;
}) {
  if (products.length === 0) {
    return (
      <div className="col-span-full py-24 text-center text-[hsl(var(--muted-foreground))]">
        Aucun produit à afficher pour le moment.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          index={i}
          priority={i < priorityCount}
        />
      ))}
    </div>
  );
}
