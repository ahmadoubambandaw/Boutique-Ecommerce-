import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { buildAuthUrl, isValidShopDomain } from "@/lib/shopify/oauth";
import { appUrl } from "@/lib/urls";

/**
 * Begin the Shopify OAuth install flow for a new tenant.
 * Usage: /api/auth/shopify?shop=my-store.myshopify.com
 */
export async function GET(request: Request) {
  const shop = new URL(request.url).searchParams.get("shop");

  if (!shop || !isValidShopDomain(shop)) {
    // No/invalid shop → send the merchant to an onboarding prompt.
    return NextResponse.redirect(new URL("/pricing", appUrl()));
  }

  if (!process.env.SHOPIFY_API_KEY) {
    return NextResponse.json(
      { error: "Shopify app credentials not configured." },
      { status: 501 },
    );
  }

  const state = crypto.randomBytes(16).toString("hex");
  const url = buildAuthUrl(shop, state);

  const res = NextResponse.redirect(url);
  // CSRF protection: store the state in an httpOnly cookie for callback checks.
  res.cookies.set("shopify_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
