import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "Conditions générales",
  description: "Conditions générales de vente et d'utilisation.",
  alternates: { canonical: "/terms" },
};

const SECTIONS = [
  ["Objet", "Les présentes conditions régissent l'utilisation du site et les ventes conclues. Toute commande implique l'acceptation pleine et entière des présentes conditions."],
  ["Prix", "Les prix sont indiqués en euros toutes taxes comprises. Ils peuvent être modifiés à tout moment mais les produits sont facturés sur la base des tarifs en vigueur au moment de la commande."],
  ["Commande", "La vente est réputée conclue à la confirmation du paiement, traité de manière sécurisée par Shopify. Un e-mail de confirmation récapitule votre commande."],
  ["Livraison", "Les délais de livraison sont indicatifs. La livraison est offerte dès 50€ d'achat en France métropolitaine. Les risques sont transférés à la remise du colis."],
  ["Rétractation & retours", "Vous disposez d'un délai de 30 jours pour retourner un article. Les frais de retour sont pris en charge. Le remboursement intervient sous 14 jours après réception."],
  ["Responsabilité", "Notre responsabilité ne saurait être engagée en cas de force majeure ou de faute du client. Les photographies des produits sont non contractuelles."],
];

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Légal" title="Conditions générales" />
      <div className="mx-auto max-w-2xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Dernière mise à jour : 16 juillet 2026
        </p>
        {SECTIONS.map(([title, body], i) => (
          <section key={title}>
            <h2 className="mb-2 text-xl font-semibold">
              {i + 1}. {title}
            </h2>
            <p className="text-[hsl(var(--muted-foreground))]">{body}</p>
          </section>
        ))}
      </div>
    </>
  );
}
