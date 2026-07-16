import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question ? Notre équipe vous répond sous 24 heures.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Nous écrire"
        title="Contactez-nous"
        description="Notre équipe est à votre écoute pour toute question."
      />
      <div className="mx-auto grid max-w-5xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:px-8">
        <div className="space-y-6">
          {[
            { icon: Mail, label: "E-mail", value: "contact@boutique.app" },
            { icon: Phone, label: "Téléphone", value: "+33 1 23 45 67 89" },
            { icon: MapPin, label: "Adresse", value: "12 rue de la Mode, 75002 Paris" },
          ].map((c) => (
            <div key={c.label} className="flex items-start gap-3">
              <c.icon className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{c.label}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
        <ContactForm />
      </div>
    </>
  );
}
