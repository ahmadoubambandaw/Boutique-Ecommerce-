import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment nous collectons, utilisons et protégeons vos données.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS = [
  ["Données collectées", "Nous collectons les informations que vous fournissez lors de la création d'un compte, d'une commande ou d'un contact (nom, e-mail, adresse). Les données de paiement sont traitées exclusivement par Shopify et ne transitent jamais par nos serveurs."],
  ["Utilisation des données", "Vos données servent à traiter vos commandes, personnaliser votre expérience et, avec votre consentement, vous adresser nos actualités. Nous ne vendons jamais vos données à des tiers."],
  ["Cookies", "Nous utilisons des cookies essentiels au fonctionnement du site et, sous réserve de votre consentement, des cookies de mesure d'audience (Google Analytics) et publicitaires (Meta Pixel)."],
  ["Vos droits", "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données. Contactez-nous à privacy@boutique.app pour exercer ces droits."],
  ["Sécurité", "Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données : chiffrement TLS, contrôle d'accès et isolation stricte des données par boutique."],
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Légal" title="Politique de confidentialité" />
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
