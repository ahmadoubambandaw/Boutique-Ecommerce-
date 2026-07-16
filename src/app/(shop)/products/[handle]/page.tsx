import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getProduct, getRecommendations } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";
import { appUrl } from "@/lib/seo";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductBuyBox } from "@/components/product/product-buy-box";
import { ProductTabs } from "@/components/product/product-tabs";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeader } from "@/components/ui/section-header";
import { JsonLd } from "@/components/seo/json-ld";

export const revalidate = 60;

type Params = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return { title: "Produit introuvable" };

  const title = product.seo.title ?? product.title;
  const description = product.seo.description ?? product.description;
  const image = product.featuredImage?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
      type: "website",
    },
    alternates: { canonical: `/products/${handle}` },
  };
}

export default async function ProductPage({ params }: Params) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const recommendations = await getRecommendations(product.id, product.handle);
  const price = product.priceRange.minVariantPrice;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: product.description,
          image: product.images.map((i) => i.url),
          brand: { "@type": "Brand", name: product.vendor },
          offers: {
            "@type": "Offer",
            url: `${appUrl()}/products/${product.handle}`,
            priceCurrency: price.currencyCode,
            price: price.amount,
            availability: product.availableForSale
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        }}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
        <Link href="/" className="hover:text-[hsl(var(--foreground))]">Accueil</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/products" className="hover:text-[hsl(var(--foreground))]">Catalogue</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="truncate text-[hsl(var(--foreground))]">{product.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} title={product.title} />
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductBuyBox product={product} />
        </div>
      </div>

      <ProductTabs product={product} />

      {recommendations.length > 0 && (
        <section className="mt-20">
          <SectionHeader eyebrow="Vous aimerez aussi" title="Produits similaires" />
          <ProductGrid products={recommendations} priorityCount={0} />
        </section>
      )}
    </div>
  );
}
