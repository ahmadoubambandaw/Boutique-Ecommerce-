import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a money amount using the store's currency. */
export function formatPrice(
  amount: number | string,
  currencyCode = "EUR",
  locale = "fr-FR",
) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

/** Percentage discount between a compare-at price and the current price. */
export function discountPercent(compareAt?: string | null, price?: string | null) {
  const was = compareAt ? parseFloat(compareAt) : 0;
  const now = price ? parseFloat(price) : 0;
  if (!was || !now || was <= now) return null;
  return Math.round(((was - now) / was) * 100);
}

/** Extract the numeric id from a Shopify global id (gid://shopify/Product/123). */
export function parseGid(gid: string) {
  return gid.split("/").pop() ?? gid;
}

/** Truncate text to a max length on a word boundary. */
export function truncate(text: string, max = 160) {
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(" ", max)) + "…";
}

/** Small delay helper. */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
