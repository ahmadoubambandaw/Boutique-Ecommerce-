import type { Metadata } from "next";
import { listCollections } from "@/lib/catalog";
import { CollectionCard } from "@/components/collection/collection-card";
import { SectionHeader } from "@/components/ui/section-header";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Collections",
  description: "Parcourez nos collections soigneusement sélectionnées.",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsPage() {
  const collections = await listCollections();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Explorez" title="Toutes les collections" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection, i) => (
          <CollectionCard key={collection.id} collection={collection} index={i} />
        ))}
      </div>
    </div>
  );
}
