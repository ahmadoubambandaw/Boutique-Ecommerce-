import type { Metadata } from "next";
import { listProducts } from "@/lib/catalog";
import { CatalogView } from "@/components/catalog/catalog-view";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Catalogue",
  description: "Découvrez l'ensemble de notre sélection de produits premium.",
  alternates: { canonical: "/products" },
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const products = await listProducts({ sort, first: 48 });

  return <CatalogView products={products} title="Catalogue" />;
}
