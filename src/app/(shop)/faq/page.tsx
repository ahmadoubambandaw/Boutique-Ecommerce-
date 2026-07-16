import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Questions fréquentes sur les commandes, la livraison et les retours.",
  alternates: { canonical: "/faq" },
};

const FAQ = [
  {
    q: "Quels sont les délais de livraison ?",
    a: "Nous expédions sous 24-48h. La livraison prend ensuite 2 à 4 jours ouvrés en France métropolitaine, 3 à 7 jours en Europe.",
  },
  {
    q: "La livraison est-elle gratuite ?",
    a: "Oui, la livraison est offerte pour toute commande supérieure à 50€ en France.",
  },
  {
    q: "Comment retourner un article ?",
    a: "Vous disposez de 30 jours pour retourner un article. Rendez-vous dans votre espace client pour générer une étiquette de retour gratuite.",
  },
  {
    q: "Quels moyens de paiement acceptez-vous ?",
    a: "Cartes bancaires, Apple Pay, Google Pay, PayPal et Shop Pay via le checkout sécurisé Shopify.",
  },
  {
    q: "Mes paiements sont-ils sécurisés ?",
    a: "Absolument. Tous les paiements sont traités par Shopify avec un chiffrement de niveau bancaire. Nous ne stockons jamais vos données de carte.",
  },
  {
    q: "Puis-je suivre ma commande ?",
    a: "Oui, un numéro de suivi vous est envoyé par e-mail dès l'expédition. Vous pouvez aussi suivre votre commande depuis la page « Suivi de commande ».",
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
