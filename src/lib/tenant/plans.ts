import type { SubscriptionPlan, Tenant } from "./types";

export type PlanDefinition = {
  id: SubscriptionPlan;
  name: string;
  priceMonthly: number;
  currency: string;
  description: string;
  stripePriceEnv: string;
  highlights: string[];
  features: Tenant["features"];
  limits: {
    products: number | "unlimited";
    staffAccounts: number;
    monthlyOrders: number | "unlimited";
  };
};

/** Subscription catalogue. Prices billed through Stripe. */
export const PLANS: Record<SubscriptionPlan, PlanDefinition> = {
  basic: {
    id: "basic",
    name: "Basic",
    priceMonthly: 29,
    currency: "EUR",
    description: "Lancez une boutique headless élégante en quelques minutes.",
    stripePriceEnv: "STRIPE_PRICE_BASIC",
    highlights: [
      "Storefront headless premium",
      "Sous-domaine boutique.app",
      "Thème & couleurs personnalisables",
      "SEO & Open Graph automatiques",
    ],
    features: {
      multiCurrency: false,
      multiLanguage: false,
      liveChat: false,
      customDomain: false,
      prioritySupport: false,
    },
    limits: { products: "unlimited", staffAccounts: 1, monthlyOrders: 500 },
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 79,
    currency: "EUR",
    description: "Pour les marques en croissance qui veulent convertir plus.",
    stripePriceEnv: "STRIPE_PRICE_PRO",
    highlights: [
      "Tout Basic, plus :",
      "Domaine personnalisé",
      "Multi-devise & Pixel Meta",
      "Chat en direct & recommandations IA",
    ],
    features: {
      multiCurrency: true,
      multiLanguage: false,
      liveChat: true,
      customDomain: true,
      prioritySupport: false,
    },
    limits: { products: "unlimited", staffAccounts: 5, monthlyOrders: 5000 },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: 249,
    currency: "EUR",
    description: "Performance et support dédiés pour les volumes importants.",
    stripePriceEnv: "STRIPE_PRICE_ENTERPRISE",
    highlights: [
      "Tout Pro, plus :",
      "Multi-langue complet",
      "Support prioritaire dédié",
      "SLA & onboarding sur-mesure",
    ],
    features: {
      multiCurrency: true,
      multiLanguage: true,
      liveChat: true,
      customDomain: true,
      prioritySupport: true,
    },
    limits: {
      products: "unlimited",
      staffAccounts: 25,
      monthlyOrders: "unlimited",
    },
  },
};

export const PLAN_LIST = Object.values(PLANS);

export function featuresForPlan(plan: SubscriptionPlan): Tenant["features"] {
  return PLANS[plan].features;
}
