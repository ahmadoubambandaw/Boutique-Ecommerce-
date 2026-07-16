"use server";

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import * as shopify from "@/lib/shopify";
import { resolveTenant } from "@/lib/tenant/registry";
import type { Cart } from "@/lib/shopify/types";

const CART_COOKIE = "boutique_cart_id";

async function hasCreds(): Promise<boolean> {
  const t = await resolveTenant();
  return Boolean(t.shopify.storeDomain && t.shopify.storefrontAccessToken);
}

/** Read the current cart from Shopify using the cart id stored in a cookie. */
export async function getCartAction(): Promise<Cart | null> {
  if (!(await hasCreds())) return null;
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return null;
  try {
    return await shopify.getCart(cartId);
  } catch {
    return null;
  }
}

async function ensureCart(): Promise<Cart | null> {
  const store = await cookies();
  const cartId = store.get(CART_COOKIE)?.value;
  if (cartId) {
    const existing = await shopify.getCart(cartId).catch(() => null);
    if (existing) return existing;
  }
  const created = await shopify.createCart();
  if (created) {
    store.set(CART_COOKIE, created.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return created;
}

export async function addToCartAction(
  merchandiseId: string,
  quantity = 1,
): Promise<{ ok: boolean; cart: Cart | null; error?: string }> {
  if (!(await hasCreds())) {
    return { ok: false, cart: null, error: "no-shopify" };
  }
  try {
    const cart = await ensureCart();
    if (!cart) return { ok: false, cart: null, error: "cart-create-failed" };
    const updated = await shopify.addToCart(cart.id, [
      { merchandiseId, quantity },
    ]);
    revalidateTag(shopify.TAGS.cart);
    return { ok: true, cart: updated };
  } catch (e) {
    return { ok: false, cart: null, error: (e as Error).message };
  }
}

export async function updateLineAction(
  lineId: string,
  merchandiseId: string,
  quantity: number,
): Promise<{ ok: boolean; cart: Cart | null }> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return { ok: false, cart: null };
  try {
    const cart =
      quantity <= 0
        ? await shopify.removeFromCart(cartId, [lineId])
        : await shopify.updateCart(cartId, [
            { id: lineId, merchandiseId, quantity },
          ]);
    revalidateTag(shopify.TAGS.cart);
    return { ok: true, cart };
  } catch {
    return { ok: false, cart: null };
  }
}

export async function removeLineAction(
  lineId: string,
): Promise<{ ok: boolean; cart: Cart | null }> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return { ok: false, cart: null };
  try {
    const cart = await shopify.removeFromCart(cartId, [lineId]);
    revalidateTag(shopify.TAGS.cart);
    return { ok: true, cart };
  } catch {
    return { ok: false, cart: null };
  }
}

export async function applyDiscountAction(
  code: string,
): Promise<{ ok: boolean; cart: Cart | null }> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return { ok: false, cart: null };
  try {
    const cart = await shopify.applyDiscount(cartId, code ? [code] : []);
    return { ok: true, cart };
  } catch {
    return { ok: false, cart: null };
  }
}
