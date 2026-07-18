/**
 * Local payment gateways (West Africa) — provider abstraction.
 *
 * Shopify checkout does not support Wave / Orange Money natively, so for
 * merchants in Senegal (and the wider UEMOA zone) we run a custom checkout:
 * the cart is validated server-side, a payment session is created on a local
 * gateway (PayDunya or CinetPay), the shopper pays by mobile money, and on
 * confirmation the order is written into Shopify via the Admin API.
 */

export type PaymentProviderName = "paydunya" | "cinetpay";

export type CheckoutCustomer = {
  name: string;
  phone: string;
  city: string;
  address: string;
  note?: string | null;
};

export type CheckoutLine = {
  variantId: string;
  title: string;
  quantity: number;
  /** Unit price, server-verified. */
  unitAmount: number;
};

export type PaymentRequest = {
  /** Our internal reference (also used for idempotency). */
  reference: string;
  amount: number;
  currencyCode: string;
  description: string;
  customer: CheckoutCustomer;
  lines: CheckoutLine[];
  /** Where the gateway sends the shopper after payment. */
  returnUrl: string;
  cancelUrl: string;
};

export type PaymentSession = {
  /** URL of the gateway-hosted payment page (Wave / Orange Money / card). */
  redirectUrl: string;
  /** Gateway token/id used to verify the payment later. */
  token: string;
};

export type PaymentVerification =
  | { status: "paid"; amount: number; reference: string }
  | { status: "pending" }
  | { status: "failed"; reason?: string };

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  createSession(request: PaymentRequest): Promise<PaymentSession>;
  /** Server-to-server confirmation — never trust redirect query params. */
  verify(token: string): Promise<PaymentVerification>;
}

export class PaymentError extends Error {
  constructor(
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "PaymentError";
  }
}
