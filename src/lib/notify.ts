import "server-only";
import { captureError, captureMessage } from "@/lib/monitoring";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/commerce/types";

/**
 * Merchant notifications for new orders.
 *
 * Sends an email via Resend (HTTP API, no SDK) when RESEND_API_KEY is set.
 * Without it, the order is still saved and we just log the notification — the
 * merchant sees the order in /admin/orders.
 *
 * Config (env):
 *   RESEND_API_KEY    secret — https://resend.com (free tier)
 *   MERCHANT_EMAIL    where to send order alerts (fallback: SUPER_ADMIN_EMAILS)
 *   ORDER_FROM_EMAIL  verified sender (fallback: onboarding@resend.dev)
 */

function merchantEmail(): string | null {
  if (process.env.MERCHANT_EMAIL) return process.env.MERCHANT_EMAIL.trim();
  const firstSuper = (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)[0];
  return firstSuper ?? null;
}

const PAYMENT_LABEL: Record<string, string> = {
  cod: "Paiement à la livraison",
  mobile_money: "Wave / Orange Money",
};

function orderHtml(order: Order): string {
  const rows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:6px 0;border-bottom:1px solid #eee">${i.title}${
          i.variantTitle && i.variantTitle !== "Default Title"
            ? ` — ${i.variantTitle}`
            : ""
        } × ${i.quantity}</td>
        <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right">${formatPrice(
          i.price * i.quantity,
          order.currency,
        )}</td>
      </tr>`,
    )
    .join("");

  const a = order.address;
  return `
  <div style="font-family:system-ui,Arial,sans-serif;max-width:560px;margin:auto;color:#111">
    <h2 style="margin:0 0 4px">🛒 Nouvelle commande #${order.orderNumber}</h2>
    <p style="color:#666;margin:0 0 16px">${PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}</p>

    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${rows}
      <tr>
        <td style="padding:8px 0;color:#666">Sous-total</td>
        <td style="padding:8px 0;text-align:right">${formatPrice(order.subtotal, order.currency)}</td>
      </tr>
      <tr>
        <td style="padding:2px 0;color:#666">Livraison</td>
        <td style="padding:2px 0;text-align:right">${
          order.deliveryFee === 0 ? "Offerte" : formatPrice(order.deliveryFee, order.currency)
        }</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-weight:700">Total</td>
        <td style="padding:8px 0;text-align:right;font-weight:700">${formatPrice(order.total, order.currency)}</td>
      </tr>
    </table>

    <h3 style="margin:20px 0 6px">Client</h3>
    <p style="margin:0;font-size:14px;line-height:1.5">
      <strong>${a.fullName}</strong><br/>
      📞 ${a.phone}${a.email ? `<br/>✉️ ${a.email}` : ""}<br/>
      📍 ${a.address}, ${a.city}${a.region ? `, ${a.region}` : ""}, ${a.country}
      ${a.note ? `<br/>📝 ${a.note}` : ""}
    </p>
  </div>`;
}

/** Notify the merchant of a new order. Never throws — failures are logged. */
export async function notifyNewOrder(order: Order): Promise<void> {
  const to = merchantEmail();
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || !to) {
    captureMessage("new order (email not configured)", {
      orderNumber: order.orderNumber,
      total: order.total,
    });
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.ORDER_FROM_EMAIL || "Boutique <onboarding@resend.dev>",
        to: [to],
        subject: `🛒 Commande #${order.orderNumber} — ${formatPrice(order.total, order.currency)}`,
        html: orderHtml(order),
        reply_to: order.address.email || undefined,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      captureError(new Error(`resend ${res.status}: ${detail.slice(0, 200)}`), {
        stage: "notify-order",
      });
    }
  } catch (err) {
    captureError(err, { stage: "notify-order" });
  }
}
