import { listProducts, listCollections } from "@/lib/catalog";
import { resolveTenant } from "@/lib/tenant/registry";
import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { ProductGrid } from "@/components/product/product-grid";
import { CollectionCard } from "@/components/collection/collection-card";
import { SectionHeader } from "@/components/ui/section-header";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { JsonLd } from "@/components/seo/json-ld";
import { appUrl } from "@/lib/seo";

// Incremental Static Regeneration — Shopify stays the source of truth,
// content refreshes every 60s and on webhook-driven revalidation.
export const revalidate = 60;

export default async function HomePage() {
  const [tenant, products, collections] = await Promise.all([
    resolveTenant(),
    listProducts({ first: 8 }),
    listCollections(),
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

      <Features />

      {collections.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Explorez"
            title="Nos collections"
            href="/collections"
          />
          <div className="grid auto-rows-[220px] grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {collections.slice(0, 5).map((collection, i) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
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
        <ProductGrid products={trending} />
      </section>

      {/* Editorial band */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[hsl(var(--accent))] px-8 py-20 text-center text-[hsl(var(--accent-foreground))] sm:py-28">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Protéger. Prévenir.
            <br />
            Sécuriser.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-balance opacity-80">
            Des équipements certifiés, conformes aux normes, et un
            accompagnement expert pour la sécurité de vos équipes et de vos
            locaux.
          </p>
        </div>
      </section>

      <RecentlyViewed />
    </>
  );
}
