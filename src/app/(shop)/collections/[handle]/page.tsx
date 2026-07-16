import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollection, getCollectionProducts } from "@/lib/catalog";
import { CatalogView } from "@/components/catalog/catalog-view";

export const revalidate = 60;

type Params = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollection(handle);
  if (!collection) return { title: "Collection introuvable" };
  return {
    title: collection.seo.title ?? collection.title,
    description: collection.seo.description ?? collection.description,
    alternates: { canonical: `/collections/${handle}` },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: Params & { searchParams: Promise<{ sort?: string }> }) {
  const { handle } = await params;
  const { sort } = await searchParams;
  const collection = await getCollection(handle);
  if (!collection) notFound();

  const products = await getCollectionProducts(handle, sort);

  return (
    <>
      {collection.description && (
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <p className="max-w-2xl text-[hsl(var(--muted-foreground))]">
            {collection.description}
          </p>
        </div>
      )}
      <CatalogView products={products} title={collection.title} />
    </>
  );
}
