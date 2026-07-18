import type { Metadata } from "next";
import { listCollectionsWithCounts } from "@/lib/catalog";
import { CollectionCard } from "@/components/collection/collection-card";
import { SectionHeader } from "@/components/ui/section-header";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Collections",
  description: "Parcourez nos catégories d'EPI et de sécurité incendie.",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsPage() {
  const collections = await listCollectionsWithCounts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Explorez" title="Toutes les collections" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {collections.map(({ collection, count }, i) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            count={count}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
