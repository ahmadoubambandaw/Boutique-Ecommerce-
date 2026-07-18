/**
 * Delivery pricing (FCFA). Flat fee, free above a threshold. Kept in a plain
 * module (not a "use server" file) so the constants can be imported by client
 * components too.
 */
export const DELIVERY_FEE = 1000;
export const FREE_DELIVERY_ABOVE = 25000;

/** Delivery fee for a given subtotal. */
export function deliveryFeeFor(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
}
