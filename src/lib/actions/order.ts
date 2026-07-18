"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { createOrder } from "@/lib/commerce/repository";
import { captureError } from "@/lib/monitoring";
import { notifyNewOrder } from "@/lib/notify";
import { deliveryFeeFor } from "@/lib/commerce/shipping";
import type { OrderItem, PaymentMethod } from "@/lib/commerce/types";

const addressSchema = z.object({
  fullName: z.string().min(1, "Nom complet requis"),
  phone: z.string().min(6, "Téléphone requis"),
  email: z.string().email("E-mail invalide").optional().or(z.literal("")),
  address: z.string().min(1, "Adresse requise"),
  city: z.string().min(1, "Ville requise"),
  region: z.string().optional().or(z.literal("")),
  note: z.string().optional().or(z.literal("")),
  paymentMethod: z.enum(["cod", "mobile_money"]),
});

export type PlaceOrderState = {
  ok?: boolean;
  orderId?: string;
  error?: string;
};

/**
 * Create an order in our own database (no Shopify). Payment is Cash on Delivery
 * or Mobile Money (Wave / Orange Money) — the order is recorded as "pending"
 * and the merchant confirms payment/fulfilment from the admin.
 */
export async function placeOrderAction(
  items: OrderItem[],
  form: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    region?: string;
    note?: string;
    paymentMethod: PaymentMethod;
  },
): Promise<PlaceOrderState> {
  if (!items || items.length === 0) {
    return { error: "Votre panier est vide." };
  }

  const parsed = addressSchema.safeParse(form);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }
  const d = parsed.data;

  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);
  const deliveryFee = deliveryFeeFor(subtotal);
  const total = subtotal + deliveryFee;

  try {
    const order = await createOrder({
      id: crypto.randomUUID(),
      items,
      address: {
        fullName: d.fullName,
        phone: d.phone,
        email: d.email || null,
        address: d.address,
        city: d.city,
        region: d.region || "",
        country: "Sénégal",
        note: d.note || null,
      },
      subtotal,
      deliveryFee,
      total,
      currency: items[0]?.price ? "XOF" : "XOF",
      paymentMethod: d.paymentMethod,
    });

    if (!order) {
      return {
        error:
          "Base de données non configurée. Impossible d'enregistrer la commande.",
      };
    }

    // Notify the merchant (email). Never blocks/fails the order.
    await notifyNewOrder(order);

    return { ok: true, orderId: order.id };
  } catch (err) {
    captureError(err, { stage: "place-order" });
    return { error: "Une erreur est survenue. Réessayez." };
  }
}
