import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Notre mission : rendre la mode premium accessible, durable et élégante.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { title: "Qualité", desc: "Des matières nobles et un savoir-faire d'exception, sans compromis." },
  { title: "Durabilité", desc: "Une production responsable pensée pour limiter notre empreinte." },
  { title: "Transparence", desc: "Des prix justes et une traçabilité complète de nos produits." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Notre histoire"
        title="La mode, plus intelligente"
        description="Nous créons des pièces intemporelles, conçues pour durer et pensées pour vous."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-lg leading-relaxed text-[hsl(var(--muted-foreground))]">
            Fondée avec la conviction que le style ne devrait jamais se faire au
            détriment de l'éthique, notre maison réunit designers, artisans et
            technologues autour d'une même exigence : proposer une expérience
            d'achat aussi belle que responsable.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} index={i}>
              <h3 className="text-xl font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                {v.desc}
              </p>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-3 gap-6 border-t border-[hsl(var(--border))] pt-10 text-center">
          {[
            ["50k+", "Clients satisfaits"],
            ["4,8/5", "Note moyenne"],
            ["100%", "Paiement sécurisé"],
          ].map(([stat, label]) => (
            <div key={label}>
              <p className="text-3xl font-semibold">{stat}</p>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
