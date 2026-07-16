import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForToken,
  isValidShopDomain,
  verifyHmac,
} from "@/lib/shopify/oauth";
import { provisionTenant } from "@/lib/tenant/provision";
import { isDbConfigured } from "@/lib/db/client";
import { captureError } from "@/lib/monitoring";
import { appUrl } from "@/lib/urls";

/**
 * Shopify OAuth callback. Verifies HMAC + state, exchanges the code for an
 * offline token, then (in production) creates the tenant record and provisions
 * the storefront. Here we validate and hand off to onboarding.
 */
export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const { shop, code, state } = params;
  const base = appUrl();

  const savedState = (await cookies()).get("shopify_oauth_state")?.value;

  if (!shop || !isValidShopDomain(shop) || !code) {
    return NextResponse.redirect(new URL("/pricing?error=invalid", base));
  }
  if (!state || state !== savedState) {
    return NextResponse.redirect(new URL("/pricing?error=state", base));
  }
  if (!verifyHmac(params)) {
    return NextResponse.redirect(new URL("/pricing?error=hmac", base));
  }

  const token = await exchangeCodeForToken(shop, code);
  if (!token) {
    return NextResponse.redirect(new URL("/pricing?error=token", base));
  }

  // Provision the tenant: Storefront token, webhooks, Stripe customer, DB row.
  // Requires a database — without one we can't persist, so guide the operator.
  if (!isDbConfigured()) {
    return NextResponse.redirect(new URL("/admin?onboarded=nodb", base));
  }

  try {
    const tenant = await provisionTenant({ shop, adminToken: token });
    if (!tenant) {
      return NextResponse.redirect(new URL("/pricing?error=provision", base));
    }
  } catch (err) {
    captureError(err, { stage: "oauth-provision", shop });
    return NextResponse.redirect(new URL("/pricing?error=provision", base));
  }

  const res = NextResponse.redirect(new URL("/admin?onboarded=1", base));
  res.cookies.delete("shopify_oauth_state");
  return res;
}
