import {
  listProducts,
  listFeaturedProducts,
  listCollectionsWithCounts,
} from "@/lib/catalog";
import { resolveTenant } from "@/lib/tenant/registry";
import { Hero } from "@/components/home/hero";
import { FeaturedSlider } from "@/components/home/featured-slider";
import { Features } from "@/components/home/features";
import { EditorialBanner } from "@/components/home/editorial-banner";
import { ProductGrid } from "@/components/product/product-grid";
import { CollectionCard } from "@/components/collection/collection-card";
import { SectionHeader } from "@/components/ui/section-header";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { CatalogEmpty } from "@/components/catalog/catalog-empty";
import { JsonLd } from "@/components/seo/json-ld";
import { appUrl } from "@/lib/seo";

// Incremental Static Regeneration — Shopify stays the source of truth,
// content refreshes every 60s and on webhook-driven revalidation.
export const revalidate = 60;

export default async function HomePage() {
  const [tenant, products, featured, collections] = await Promise.all([
    resolveTenant(),
    listProducts({ first: 8 }),
    listFeaturedProducts(4),
    listCollectionsWithCounts(),
  ]);

  const trending = products.slice(0, 8);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Store",
          name: tenant.branding.storeName,
          url: appUrl(),
          description: tenant.seo.metaDescription,
        }}
      />

      <Hero tagline={tenant.branding.tagline ?? ""} />

      {featured.length > 0 && <FeaturedSlider products={featured} />}

      <Features />

      {collections.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Explorez"
            title="Nos collections"
            href="/collections"
          />
          <div className="grid grid-cols-1 gap-4 sm:auto-rows-[220px] sm:grid-cols-4 sm:gap-6">
            {collections.slice(0, 5).map(({ collection, count }, i) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                count={count}
                index={i}
                large={i === 0}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Sélection"
          title="Produits populaires"
          href="/products"
        />
        {trending.length > 0 ? (
          <ProductGrid products={trending} />
        ) : (
          <CatalogEmpty />
        )}
      </section>

      {/* Editorial band */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EditorialBanner
          images={[
            "https://cdktjngwukkeededkvji.supabase.co/storage/v1/object/public/product-images/gse-upload/harnais-de-securite-antichute-rouge-noir.png",
            "https://cdktjngwukkeededkvji.supabase.co/storage/v1/object/public/product-images/93c47bad-1482-4aca-881b-87d0c4dd293a.png",
            "https://cdktjngwukkeededkvji.supabase.co/storage/v1/object/public/product-images/15c00127-100f-4fda-b587-b9d82229915c.jpg",
            "https://cdktjngwukkeededkvji.supabase.co/storage/v1/object/public/product-images/afb8e4fa-fa99-468f-97dd-2d92b6147115.jpg",
          ]}
        />
      </section>

      <RecentlyViewed />
    </>
  );
}
