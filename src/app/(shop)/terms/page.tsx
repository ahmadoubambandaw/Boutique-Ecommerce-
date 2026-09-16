import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { CONTACT } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Conditions générales",
  description:
    "Conditions générales de vente de GSE — Global Safety Équipement : prix en FCFA, livraison à Dakar, paiement à la livraison ou mobile money.",
  alternates: { canonical: "/terms" },
};

const SECTIONS = [
  ["Objet", "Les présentes conditions régissent l'utilisation du site et les ventes conclues par GSE — Global Safety Équipement. Toute commande implique l'acceptation pleine et entière des présentes conditions."],
  ["Prix", "Les prix sont indiqués en francs CFA (FCFA / XOF), toutes taxes comprises. Ils peuvent être modifiés à tout moment, mais les produits sont facturés sur la base des tarifs en vigueur au moment de la commande."],
  ["Commande", "La commande est enregistrée dès sa validation sur le site. Elle est confirmée par notre équipe par téléphone avant expédition. Aucun paiement en ligne n'est requis à la commande : le règlement s'effectue à la livraison (espèces) ou par mobile money (Wave / Orange Money)."],
  ["Livraison", "Nous livrons principalement dans la région de Dakar, sous 24 à 72h ouvrées selon la disponibilité du produit et votre localisation. Les frais de livraison s'élèvent à 1 000 FCFA et sont offerts dès 100 000 FCFA d'achat. Pour une livraison hors de Dakar, contactez-nous au préalable pour connaître les délais et modalités. Les risques sont transférés au client à la remise du colis."],
  ["Rétractation & retours", `En cas de défaut ou de non-conformité constaté à la réception, contactez-nous sous 48h à ${CONTACT.email} ou au ${CONTACT.phonesJoined}. Selon l'état du produit, nous organisons l'échange ou le remboursement.`],
  ["Responsabilité", "Notre responsabilité ne saurait être engagée en cas de force majeure ou de faute du client. Les photographies des produits sont non contractuelles."],
];

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Légal" title="Conditions générales" />
      <div className="mx-auto max-w-2xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Dernière mise à jour : 15 septembre 2026
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
