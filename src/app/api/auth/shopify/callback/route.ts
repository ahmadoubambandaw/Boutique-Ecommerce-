import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForToken,
  isValidShopDomain,
  verifyHmac,
} from "@/lib/shopify/oauth";

/**
 * Shopify OAuth callback. Verifies HMAC + state, exchanges the code for an
 * offline token, then (in production) creates the tenant record and provisions
 * the storefront. Here we validate and hand off to onboarding.
 */
export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const { shop, code, state } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.url;

  const savedState = (await cookies()).get("shopify_oauth_state")?.value;

  if (!shop || !isValidShopDomain(shop) || !code) {
    return NextResponse.redirect(new URL("/pricing?error=invalid", appUrl));
  }
  if (!state || state !== savedState) {
    return NextResponse.redirect(new URL("/pricing?error=state", appUrl));
  }
  if (!verifyHmac(params)) {
    return NextResponse.redirect(new URL("/pricing?error=hmac", appUrl));
  }

  const token = await exchangeCodeForToken(shop, code);
  if (!token) {
    return NextResponse.redirect(new URL("/pricing?error=token", appUrl));
  }

  // TODO(multi-tenant): persist the tenant + token, register webhooks,
  // create the Stripe subscription, then redirect to the merchant dashboard.
  return NextResponse.redirect(new URL("/admin?onboarded=1", appUrl));
}
