import Image from "next/image";
import { AlertCircle } from "lucide-react";
import { listProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const revalidate = 300;

export default async function AdminProductsPage() {
  const products = await listProducts({ first: 50 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Produits</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Catalogue synchronisé depuis Shopify.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p>
          Lecture seule : les produits ne sont jamais modifiés depuis ce
          tableau de bord. Toute modification se fait dans Shopify, source unique
          de vérité, et se reflète instantanément ici.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[hsl(var(--border))]">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--border))] text-left text-[hsl(var(--muted-foreground))]">
              <th className="p-4 font-medium">Produit</th>
              <th className="p-4 font-medium">Marque</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Statut</th>
              <th className="p-4 text-right font-medium">Prix</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-[hsl(var(--border))] last:border-0">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[hsl(var(--muted))]">
                      {p.featuredImage && (
                        <Image
                          src={p.featuredImage.url}
                          alt={p.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <span className="font-medium">{p.title}</span>
                  </div>
                </td>
                <td className="p-4 text-[hsl(var(--muted-foreground))]">{p.vendor}</td>
                <td className="p-4 tabular-nums">{p.totalInventory ?? "—"}</td>
                <td className="p-4">
                  <Badge variant={p.availableForSale ? "default" : "muted"}>
                    {p.availableForSale ? "En stock" : "Épuisé"}
                  </Badge>
                </td>
                <td className="p-4 text-right tabular-nums">
                  {formatPrice(
                    p.priceRange.minVariantPrice.amount,
                    p.priceRange.minVariantPrice.currencyCode,
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
