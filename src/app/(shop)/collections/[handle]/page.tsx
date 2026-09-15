import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCollection, getCollectionProducts } from "@/lib/catalog";
import { CatalogView } from "@/components/catalog/catalog-view";
import { JsonLd } from "@/components/seo/json-ld";
import { appUrl } from "@/lib/seo";

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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: appUrl() },
            { "@type": "ListItem", position: 2, name: "Collections", item: `${appUrl()}/collections` },
            {
              "@type": "ListItem",
              position: 3,
              name: collection.title,
              item: `${appUrl()}/collections/${handle}`,
            },
          ],
        }}
      />
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <nav className="mb-2 flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
          <Link href="/" className="hover:text-[hsl(var(--foreground))]">Accueil</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/collections" className="hover:text-[hsl(var(--foreground))]">Collections</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="truncate text-[hsl(var(--foreground))]">{collection.title}</span>
        </nav>
        {collection.description && (
          <p className="max-w-2xl text-[hsl(var(--muted-foreground))]">
            {collection.description}
          </p>
        )}
      </div>
      <CatalogView products={products} title={collection.title} />
    </>
  );
}
