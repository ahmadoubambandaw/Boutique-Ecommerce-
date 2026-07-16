import type { Metadata } from "next";
import { search } from "@/lib/catalog";
import { CatalogView } from "@/components/catalog/catalog-view";

export const metadata: Metadata = {
  title: "Recherche",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q = "", sort } = await searchParams;
  const products = q ? await search(q, sort) : [];

  return (
    <CatalogView
      products={products}
      title={q ? `Résultats pour « ${q} »` : "Recherche"}
    />
  );
}
