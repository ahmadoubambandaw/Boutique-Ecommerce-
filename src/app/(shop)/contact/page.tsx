import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { ContactForm } from "@/components/contact-form";
import { CONTACT } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question sur nos EPI ou la sécurité incendie ? Écrivez-nous.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Nous écrire"
        title="Contactez-nous"
        description="Notre équipe est à votre écoute pour vos besoins en EPI et sécurité incendie."
      />
      <div className="mx-auto grid max-w-5xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:px-8">
        <div className="space-y-6">
          {[
            { icon: Mail, label: "E-mail", value: CONTACT.email },
            { icon: Phone, label: "Téléphone", value: CONTACT.phone },
            { icon: MessageCircle, label: "WhatsApp", value: CONTACT.whatsapp },
            { icon: MapPin, label: "Adresse", value: CONTACT.address },
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
