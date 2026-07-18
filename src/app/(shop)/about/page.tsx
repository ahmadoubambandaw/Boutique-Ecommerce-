import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Flame,
  HardHat,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { CONTACT } from "@/lib/contact";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "GSE — Global Safety Équipement : votre partenaire en équipements de protection individuelle (EPI) et en sécurité incendie au Sénégal.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { icon: ShieldCheck, title: "Sécurité", desc: "Protéger les personnes et les biens est notre priorité absolue." },
  { icon: Award, title: "Qualité", desc: "Des équipements fiables et conformes aux normes en vigueur." },
  { icon: HeartHandshake, title: "Professionnalisme", desc: "Un service sérieux, rigoureux et digne de confiance." },
  { icon: Lightbulb, title: "Innovation", desc: "Des solutions adaptées à l'évolution des besoins et des normes." },
  { icon: Users, title: "Engagement", desc: "Votre satisfaction guide chacune de nos actions." },
];

const ENGAGEMENTS = [
  "Fournir des équipements certifiés et conformes aux normes nationales et internationales.",
  "Offrir un accompagnement personnalisé selon les besoins de chaque client.",
  "Garantir un excellent rapport qualité-prix.",
  "Assurer une disponibilité optimale de nos produits.",
  "Bâtir des relations durables fondées sur la confiance et le professionnalisme.",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="GSE — Global Safety Équipement"
        title="Votre sécurité, notre engagement."
        description="Votre partenaire en équipements de protection individuelle et en protection incendie au Sénégal."
      />

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Intro + logo */}
        <Reveal>
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white">
              <Image
                src="/gse-logo.jpg"
                alt="GSE — Global Safety Équipement"
                fill
                sizes="128px"
                className="object-contain p-2"
              />
            </div>
            <p className="text-lg leading-relaxed text-[hsl(var(--muted-foreground))]">
              <strong className="text-[hsl(var(--foreground))]">
                GSE — Global Safety Équipement
              </strong>{" "}
              est une entreprise spécialisée dans la fourniture d'équipements de
              protection individuelle (EPI) et de solutions de sécurité incendie.
              Nous accompagnons les entreprises, industries, chantiers,
              établissements publics et collectivités dans la prévention des
              risques professionnels et la protection des personnes et des biens.
            </p>
          </div>
        </Reveal>

        {/* Mission & Vision */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl border border-[hsl(var(--border))] p-7">
              <Target className="h-7 w-7 text-[hsl(var(--brand-red))]" />
              <h2 className="mt-4 text-xl font-semibold">Notre mission</h2>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                Contribuer à la réduction des risques professionnels et à la
                protection des personnes et des biens, en mettant à disposition
                de nos clients des équipements de haute qualité et un service
                irréprochable.
              </p>
            </div>
          </Reveal>
          <Reveal index={1}>
            <div className="h-full rounded-3xl border border-[hsl(var(--border))] p-7">
              <Lightbulb className="h-7 w-7 text-[hsl(var(--brand-red))]" />
              <h2 className="mt-4 text-xl font-semibold">Notre vision</h2>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                Devenir un acteur de référence dans le domaine de la sécurité au
                travail et de la protection incendie en Afrique, en proposant des
                solutions innovantes, fiables et adaptées aux défis des
                entreprises modernes.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Values */}
        <div className="mt-16">
          <h2 className="text-center text-2xl font-semibold">Nos valeurs</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} index={i}>
                <v.icon className="h-6 w-6 text-[hsl(var(--accent))]" />
                <h3 className="mt-3 text-lg font-semibold">{v.title}</h3>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {v.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Engagements */}
        <div className="mt-16 rounded-3xl bg-[hsl(var(--muted))] p-8">
          <h2 className="text-2xl font-semibold">Nos engagements</h2>
          <ul className="mt-6 space-y-3">
            {ENGAGEMENTS.map((e) => (
              <li key={e} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--accent))]" />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Ranges */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          <Reveal>
            <Link
              href="/collections"
              className="group block h-full rounded-3xl border border-[hsl(var(--border))] p-7 transition-colors hover:border-[hsl(var(--accent))]"
            >
              <HardHat className="h-7 w-7 text-[hsl(var(--accent))]" />
              <h3 className="mt-4 text-lg font-semibold">
                Équipements de protection individuelle
              </h3>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                Casques, chaussures, gants, lunettes, protections auditives,
                masques respiratoires, vêtements haute visibilité et systèmes
                antichute.
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-[hsl(var(--accent))] group-hover:underline">
                Voir la gamme EPI →
              </span>
            </Link>
          </Reveal>
          <Reveal index={1}>
            <Link
              href="/collections"
              className="group block h-full rounded-3xl border border-[hsl(var(--border))] p-7 transition-colors hover:border-[hsl(var(--brand-red))]"
            >
              <Flame className="h-7 w-7 text-[hsl(var(--brand-red))]" />
              <h3 className="mt-4 text-lg font-semibold">Sécurité incendie</h3>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                Extincteurs, robinets d'incendie armés (RIA), détecteurs et
                alarmes, signalisation de sécurité et éclairage de secours.
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-[hsl(var(--brand-red))] group-hover:underline">
                Voir la gamme incendie →
              </span>
            </Link>
          </Reveal>
        </div>

        {/* CTA */}
        <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl border border-[hsl(var(--border))] p-10 text-center">
          <h2 className="text-2xl font-semibold">Un besoin en sécurité ?</h2>
          <p className="max-w-xl text-sm text-[hsl(var(--muted-foreground))]">
            Notre équipe vous conseille et vous accompagne. Contactez-nous au{" "}
            {CONTACT.phone} ou par e-mail à {CONTACT.email}.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex h-11 items-center rounded-full bg-[hsl(var(--accent))] px-6 text-sm font-medium text-[hsl(var(--accent-foreground))] transition-opacity hover:opacity-90"
            >
              Voir le catalogue
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center rounded-full border border-[hsl(var(--border))] px-6 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))]"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
