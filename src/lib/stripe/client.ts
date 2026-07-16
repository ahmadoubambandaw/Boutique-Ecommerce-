import "server-only";
import Stripe from "stripe";

/**
 * Lazy Stripe singleton. Returns null when STRIPE_SECRET_KEY is not configured
 * so the app builds and runs without billing wired up.
 */
let _stripe: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (_stripe !== undefined) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  _stripe = key
    ? new Stripe(key, { apiVersion: "2026-06-24.dahlia", typescript: true })
    : null;
  return _stripe;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
