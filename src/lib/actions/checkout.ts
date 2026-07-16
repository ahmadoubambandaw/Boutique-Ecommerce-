"use server";

import * as shopify from "@/lib/shopify";
import { resolveTenant } from "@/lib/tenant/registry";

/**
 * Build a real Shopify cart from the client line items and return the secure
 * Shopify-hosted checkout URL. Payment, taxes, shipping and discounts are all
 * finalised by Shopify — we never handle card data ourselves.
 */
export async function startCheckoutAction(
  lines: { variantId: string; quantity: number }[],
): Promise<{ ok: boolean; checkoutUrl?: string; error?: string }> {
  const tenant = await resolveTenant();
  if (!tenant.shopify.storeDomain || !tenant.shopify.storefrontAccessToken) {
    return { ok: false, error: "no-shopify" };
  }
  if (!lines.length) return { ok: false, error: "empty-cart" };

  try {
    const cart = await shopify.createCart(
      lines.map((l) => ({ merchandiseId: l.variantId, quantity: l.quantity })),
    );
    if (!cart?.checkoutUrl) {
      return { ok: false, error: "checkout-unavailable" };
    }
    return { ok: true, checkoutUrl: cart.checkoutUrl };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
