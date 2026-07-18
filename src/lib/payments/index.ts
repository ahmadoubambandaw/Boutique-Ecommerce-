import "server-only";
import { paydunya, isPaydunyaConfigured } from "./paydunya";
import { cinetpay, isCinetpayConfigured } from "./cinetpay";
import type { PaymentProvider } from "./types";

export * from "./types";

/**
 * Resolve the active local payment provider from the environment.
 *
 *   PAYMENT_PROVIDER=paydunya | cinetpay   (optional — auto-detects otherwise)
 *
 * Returns null when no gateway is configured, in which case the custom
 * checkout only offers cash on delivery.
 */
export function getPaymentProvider(): PaymentProvider | null {
  const forced = process.env.PAYMENT_PROVIDER;
  if (forced === "paydunya") return isPaydunyaConfigured() ? paydunya : null;
  if (forced === "cinetpay") return isCinetpayConfigured() ? cinetpay : null;

  if (isPaydunyaConfigured()) return paydunya;
  if (isCinetpayConfigured()) return cinetpay;
  return null;
}

export function isLocalPaymentConfigured(): boolean {
  return getPaymentProvider() !== null;
}
