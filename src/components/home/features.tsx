import { Truck, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const FEATURES = [
  { icon: Truck, title: "Livraison offerte", desc: "Dès 50€ d'achat, partout en France." },
  { icon: RefreshCw, title: "Retours 30 jours", desc: "Échange et remboursement simples." },
  { icon: ShieldCheck, title: "Paiement sécurisé", desc: "Checkout Shopify chiffré." },
  { icon: Sparkles, title: "Qualité premium", desc: "Sélection exigeante et durable." },
];

export function Features() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} index={i}>
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-[hsl(var(--border))] p-6 text-center lift">
              <f.icon className="h-7 w-7" />
              <div>
                <h3 className="font-medium">{f.title}</h3>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {f.desc}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
