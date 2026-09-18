/**
 * Delivery pricing (FCFA). Free under a threshold; at or above it, the fee
 * depends on the order (volume/weight) and is settled directly with the
 * customer rather than charged automatically. Kept in a plain module (not a
 * "use server" file) so the constants can be imported by client components
 * too.
 */
export const DELIVERY_QUOTE_ABOVE = 100000;

/** Delivery fee to charge through the site for a given subtotal. Orders at
 * or above the threshold are never auto-charged — their fee is arranged
 * with the customer, so this stays 0 and the UI shows "à confirmer". */
export function deliveryFeeFor(_subtotal: number): number {
  return 0;
}

/** Whether this subtotal needs its delivery fee arranged with the customer. */
export function deliveryNeedsQuote(subtotal: number): boolean {
  return subtotal >= DELIVERY_QUOTE_ABOVE;
}
