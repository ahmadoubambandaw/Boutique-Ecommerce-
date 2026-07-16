import type { Metadata } from "next";
import { Check } from "lucide-react";
import { PLAN_LIST } from "@/lib/tenant/plans";
import { formatPrice } from "@/lib/utils";
import { PageHero } from "@/components/ui/page-hero";
import { PlanCta } from "@/components/pricing/plan-cta";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Des plans simples pour lancer votre boutique headless : Basic, Pro, Enterprise.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="SaaS multi-boutiques"
        title="Lancez votre boutique headless"
        description="Connectez votre Shopify, choisissez votre plan, personnalisez tout. Sans code."
      />
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
        {PLAN_LIST.map((plan) => {
          const featured = plan.id === "pro";
          return (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-3xl border p-8",
                featured
                  ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-2xl lg:-my-4 lg:py-12"
                  : "border-[hsl(var(--border))]",
              )}
            >
              {featured && (
                <span className="mb-3 w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                  Le plus populaire
                </span>
              )}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p
                className={cn(
                  "mt-1 text-sm",
                  featured ? "opacity-80" : "text-[hsl(var(--muted-foreground))]",
                )}
              >
                {plan.description}
              </p>
              <p className="mt-6 text-4xl font-semibold tracking-tight">
                {formatPrice(plan.priceMonthly, plan.currency)}
                <span className="text-base font-normal opacity-70">/mois</span>
              </p>
              <PlanCta plan={plan.id} featured={featured} />
              <ul className="mt-8 space-y-3 text-sm">
                {plan.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className={featured ? "" : "text-[hsl(var(--muted-foreground))]"}>
                      {h}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}
