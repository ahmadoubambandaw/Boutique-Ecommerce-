import "server-only";
import {
  PaymentError,
  type PaymentProvider,
  type PaymentRequest,
  type PaymentSession,
  type PaymentVerification,
} from "./types";

/**
 * CinetPay adapter — mobile money (Wave, Orange Money, MTN, Moov…) and cards
 * across West/Central Africa. Docs: https://docs.cinetpay.com
 *
 * Env:
 *   CINETPAY_API_KEY, CINETPAY_SITE_ID
 */

const API = "https://api-checkout.cinetpay.com/v2";

export function isCinetpayConfigured(): boolean {
  return Boolean(process.env.CINETPAY_API_KEY && process.env.CINETPAY_SITE_ID);
}

export const cinetpay: PaymentProvider = {
  name: "cinetpay",

  async createSession(req: PaymentRequest): Promise<PaymentSession> {
    const res = await fetch(`${API}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: process.env.CINETPAY_API_KEY,
        site_id: process.env.CINETPAY_SITE_ID,
        transaction_id: req.reference,
        amount: Math.round(req.amount),
        currency: req.currencyCode || "XOF",
        description: req.description,
        return_url: req.returnUrl,
        notify_url: req.returnUrl,
        channels: "MOBILE_MONEY",
        customer_name: req.customer.name,
        customer_phone_number: req.customer.phone,
        customer_address: req.customer.address,
        customer_city: req.customer.city,
        customer_country: "SN",
      }),
    });

    const json = (await res.json().catch(() => ({}))) as {
      code?: string;
      message?: string;
      data?: { payment_url?: string };
    };

    if (json.code !== "201" || !json.data?.payment_url) {
      throw new PaymentError(
        json.message ?? "CinetPay: création du paiement refusée.",
        json,
      );
    }

    // CinetPay verifies by transaction_id (our reference).
    return { token: req.reference, redirectUrl: json.data.payment_url };
  },

  async verify(token: string): Promise<PaymentVerification> {
    const res = await fetch(`${API}/payment/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: process.env.CINETPAY_API_KEY,
        site_id: process.env.CINETPAY_SITE_ID,
        transaction_id: token,
      }),
      cache: "no-store",
    });

    const json = (await res.json().catch(() => ({}))) as {
      code?: string;
      data?: { status?: string; amount?: string };
    };

    const status = json.data?.status;
    if (status === "ACCEPTED") {
      return {
        status: "paid",
        amount: parseFloat(json.data?.amount ?? "0") || 0,
        reference: token,
      };
    }
    if (status === "PENDING" || status === "WAITING_FOR_CUSTOMER") {
      return { status: "pending" };
    }
    return { status: "failed", reason: status };
  },
};
