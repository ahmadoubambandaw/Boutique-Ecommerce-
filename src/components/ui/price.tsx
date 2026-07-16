"use client";

import * as React from "react";
import { CURRENCIES, convert, useCurrency, type CurrencyCode } from "@/lib/store/currency";
import { formatPrice } from "@/lib/utils";

/**
 * Renders a price converted into the shopper's selected currency.
 *
 * Demo mode uses static rates; with Shopify connected the base prices already
 * arrive localized via @inContext, so conversion becomes a no-op when
 * base === selected. Hydration-safe: renders the base currency on the server
 * and switches after mount.
 */
export function Price({
  amount,
  baseCurrency = "EUR",
  className,
}: {
  amount: string | number;
  baseCurrency?: string;
  className?: string;
}) {
  const currency = useCurrency((s) => s.currency);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isKnown = CURRENCIES.some((c) => c.code === baseCurrency);
  const base: CurrencyCode = isKnown ? (baseCurrency as CurrencyCode) : "EUR";

  const value = typeof amount === "string" ? parseFloat(amount) : amount;

  if (!mounted || !isKnown || currency === base) {
    return <span className={className}>{formatPrice(value, baseCurrency)}</span>;
  }

  const converted = convert(value, base, currency);
  const locale = CURRENCIES.find((c) => c.code === currency)?.locale ?? "fr-FR";
  return <span className={className}>{formatPrice(converted, currency, locale)}</span>;
}
