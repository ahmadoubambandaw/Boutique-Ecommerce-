import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Livraison à Dakar, paiement à la livraison ou mobile money, retours : les réponses à vos questions sur GSE — Global Safety Équipement.",
  alternates: { canonical: "/faq" },
};

const FAQ = [
  {
    q: "Quels sont les délais et zones de livraison ?",
    a: "Nous livrons principalement dans la région de Dakar, en général sous 24 à 72h ouvrées selon votre localisation et la disponibilité du produit. Pour une livraison en dehors de Dakar, contactez-nous au +221 70 544 26 02 ou par WhatsApp pour connaître les délais et modalités.",
  },
  {
    q: "La livraison est-elle gratuite ?",
    a: "La livraison coûte 1 000 FCFA et devient gratuite dès 25 000 FCFA d'achat.",
  },
  {
    q: "Quels moyens de paiement acceptez-vous ?",
    a: "Paiement à la livraison (espèces), ou par mobile money Wave / Orange Money : vous réglez au numéro communiqué après confirmation téléphonique de votre commande. Nous n'acceptons pas encore le paiement en ligne par carte bancaire.",
  },
  {
    q: "Vos équipements sont-ils certifiés ?",
    a: "Oui, nos EPI et équipements de sécurité incendie sont conformes aux normes EN / ISO en vigueur (EN ISO 20345 pour les chaussures, EN 397 pour les casques, EN 388 pour les gants, etc.).",
  },
  {
    q: "Comment retourner ou échanger un article ?",
    a: "Si un article présente un défaut ou ne correspond pas à votre commande, contactez-nous sous 48h après réception à commerciale.gse@gmail.com ou au +221 70 544 26 02 : nous organisons l'échange ou le remboursement selon l'état du produit.",
  },
  {
    q: "Puis-je suivre ma commande ?",
    a: "Oui, depuis la page « Suivi de commande », ou en nous contactant directement par téléphone ou WhatsApp avec votre numéro de commande.",
  },
  {
    q: "Proposez-vous des tarifs pour les commandes en gros ou les entreprises ?",
    a: "Oui, contactez notre équipe commerciale pour un devis adapté aux besoins de votre entreprise, chantier ou collectivité.",
  },
];

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />
      <PageHero eyebrow="Aide" title="Questions fréquentes" />
      <div className="mx-auto max-w-2xl space-y-3 px-4 py-16 sm:px-6 lg:px-8">
        {FAQ.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-[hsl(var(--border))] p-5"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
              {item.q}
              <span className="text-[hsl(var(--muted-foreground))] transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </>
  );
}
