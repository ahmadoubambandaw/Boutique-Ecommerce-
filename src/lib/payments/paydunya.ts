import "server-only";
import {
  PaymentError,
  type PaymentProvider,
  type PaymentRequest,
  type PaymentSession,
  type PaymentVerification,
} from "./types";

/**
 * PayDunya adapter (Senegal) — supports Wave, Orange Money, Free Money, cards.
 * Docs: https://paydunya.com/developers
 *
 * Env:
 *   PAYDUNYA_MASTER_KEY, PAYDUNYA_PRIVATE_KEY, PAYDUNYA_TOKEN
 *   PAYDUNYA_MODE = "test" | "live"   (default test)
 */

function baseUrl(): string {
  return process.env.PAYDUNYA_MODE === "live"
    ? "https://app.paydunya.com/api/v1"
    : "https://app.paydunya.com/sandbox-api/v1";
}

function headers(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY ?? "",
    "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY ?? "",
    "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN ?? "",
  };
}

export function isPaydunyaConfigured(): boolean {
  return Boolean(
    process.env.PAYDUNYA_MASTER_KEY &&
      process.env.PAYDUNYA_PRIVATE_KEY &&
      process.env.PAYDUNYA_TOKEN,
  );
}

export const paydunya: PaymentProvider = {
  name: "paydunya",

  async createSession(req: PaymentRequest): Promise<PaymentSession> {
    const res = await fetch(`${baseUrl()}/checkout-invoice/create`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        invoice: {
          // XOF has no decimals — PayDunya expects integer amounts.
          total_amount: Math.round(req.amount),
          description: req.description,
          items: Object.fromEntries(
            req.lines.map((l, i) => [
              `item_${i}`,
              {
                name: l.title,
                quantity: l.quantity,
                unit_price: Math.round(l.unitAmount),
                total_price: Math.round(l.unitAmount * l.quantity),
              },
            ]),
          ),
        },
        store: { name: process.env.STORE_NAME ?? "Boutique" },
        actions: {
          return_url: req.returnUrl,
          cancel_url: req.cancelUrl,
          callback_url: req.returnUrl,
        },
        custom_data: {
          reference: req.reference,
          customer_name: req.customer.name,
          customer_phone: req.customer.phone,
        },
      }),
    });

    const json = (await res.json().catch(() => ({}))) as {
      response_code?: string;
      response_text?: string;
      token?: string;
      invoice_url?: string;
    };

    if (json.response_code !== "00" || !json.token) {
      throw new PaymentError(
        json.response_text ?? "PayDunya: création de la facture refusée.",
        json,
      );
    }

    return {
      token: json.token,
      redirectUrl:
        json.invoice_url ??
        `https://paydunya.com/checkout/invoice/${json.token}`,
    };
  },

  async verify(token: string): Promise<PaymentVerification> {
    const res = await fetch(`${baseUrl()}/checkout-invoice/confirm/${token}`, {
      headers: headers(),
      cache: "no-store",
    });
    const json = (await res.json().catch(() => ({}))) as {
      status?: string;
      invoice?: { total_amount?: number };
      custom_data?: { reference?: string };
    };

    if (json.status === "completed") {
      return {
        status: "paid",
        amount: json.invoice?.total_amount ?? 0,
        reference: json.custom_data?.reference ?? "",
      };
    }
    if (json.status === "pending") return { status: "pending" };
    return { status: "failed", reason: json.status };
  },
};
