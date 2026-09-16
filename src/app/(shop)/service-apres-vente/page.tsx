import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardCheck,
  Flame,
  HardHat,
  Mountain,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { CONTACT } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Service après-vente",
  description:
    "Suivi de chantier, suivi HSE, recharge et installation d'extincteurs et RIA, location de matériel de construction, d'EPC et d'équipement de travail en hauteur — les services GSE au-delà de la vente.",
  alternates: { canonical: "/service-apres-vente" },
};

const SERVICES = [
  {
    icon: HardHat,
    title: "Suivi de chantier",
    desc: "Accompagnement sur site pour garantir la bonne mise en œuvre des équipements de sécurité tout au long du chantier.",
  },
  {
    icon: ClipboardCheck,
    title: "Suivi HSE",
    desc: "Appui à vos équipes Hygiène, Sécurité, Environnement pour le respect des normes et la prévention des risques professionnels.",
  },
  {
    icon: Flame,
    title: "Recharge d'extincteurs",
    desc: "Recharge et remise en conformité de vos extincteurs après utilisation ou à l'échéance de contrôle.",
  },
  {
    icon: Wrench,
    title: "Installation extincteurs et RIA",
    desc: "Installation et mise en service de vos extincteurs et Robinets d'Incendie Armés (RIA) par notre équipe.",
  },
  {
    icon: Truck,
    title: "Location de matériel de construction",
    desc: "Mise à disposition de matériel de chantier adapté à la durée et aux besoins de votre projet.",
  },
  {
    icon: ShieldCheck,
    title: "Location d'EPC",
    desc: "Location d'équipements de protection collective (garde-corps, filets, balisage) pour sécuriser vos chantiers.",
  },
  {
    icon: Mountain,
    title: "Location d'équipement travail en hauteur",
    desc: "Harnais, lignes de vie, échafaudages et autres équipements pour les interventions en hauteur.",
  },
];

export default function ServiceApresVentePage() {
  return (
    <>
      <PageHero
        eyebrow="Au-delà de la vente"
        title="Service après-vente"
        description="GSE vous accompagne aussi après l'achat : suivi de chantier, entretien de vos équipements incendie et location de matériel de sécurité."
      />

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} index={i}>
              <div className="h-full rounded-3xl border border-[hsl(var(--border))] p-6">
                <s.icon className="h-7 w-7 text-[hsl(var(--accent))]" />
                <h2 className="mt-4 text-lg font-semibold">{s.title}</h2>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl border border-[hsl(var(--border))] p-10 text-center">
          <h2 className="text-2xl font-semibold">
            Besoin d&apos;un de ces services ?
          </h2>
          <p className="max-w-xl text-sm text-[hsl(var(--muted-foreground))]">
            Contactez notre équipe pour un devis adapté à votre chantier ou
            votre entreprise, au {CONTACT.phonesJoined} ou par e-mail à{" "}
            {CONTACT.email}.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center rounded-full bg-[hsl(var(--accent))] px-6 text-sm font-medium text-[hsl(var(--accent-foreground))] transition-opacity hover:opacity-90"
            >
              Nous contacter
            </Link>
            <Link
              href="/products"
              className="inline-flex h-11 items-center rounded-full border border-[hsl(var(--border))] px-6 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))]"
            >
              Voir le catalogue
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
