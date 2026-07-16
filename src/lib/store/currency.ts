"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CurrencyCode = "EUR" | "USD" | "GBP" | "CHF" | "CAD";

export const CURRENCIES: { code: CurrencyCode; symbol: string; label: string; locale: string }[] = [
  { code: "EUR", symbol: "€", label: "Euro", locale: "fr-FR" },
  { code: "USD", symbol: "$", label: "US Dollar", locale: "en-US" },
  { code: "GBP", symbol: "£", label: "British Pound", locale: "en-GB" },
  { code: "CHF", symbol: "CHF", label: "Swiss Franc", locale: "de-CH" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar", locale: "en-CA" },
];

/**
 * Static conversion rates (base: EUR) used for the demo currency switcher.
 * In production, Shopify presentment prices via the Storefront `@inContext`
 * directive provide real localized pricing — swap these for that.
 */
export const RATES: Record<CurrencyCode, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.85,
  CHF: 0.96,
  CAD: 1.47,
};

type CurrencyState = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
};

export const useCurrency = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: "EUR",
      setCurrency: (currency) => set({ currency }),
    }),
    { name: "boutique-currency" },
  ),
);

/** Convert an amount from its base currency into the target currency. */
export function convert(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  const inEur = amount / (RATES[from] ?? 1);
  return inEur * (RATES[to] ?? 1);
}
