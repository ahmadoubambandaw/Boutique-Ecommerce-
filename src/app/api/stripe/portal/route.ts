import { NextResponse } from "next/server";
import { createBillingPortal } from "@/lib/stripe/billing";
import { resolveTenant } from "@/lib/tenant/registry";

/** Redirect the current tenant to the Stripe Billing Portal. */
export async function GET() {
  const tenant = await resolveTenant();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // In production this id lives on the tenant row (stripeCustomerId).
  const stripeCustomerId = (tenant as { stripeCustomerId?: string })
    .stripeCustomerId;

  if (!stripeCustomerId) {
    return NextResponse.redirect(new URL("/pricing", appUrl));
  }

  const result = await createBillingPortal(stripeCustomerId);
  if ("error" in result) {
    return NextResponse.redirect(new URL("/admin/settings?billing=error", appUrl));
  }
  return NextResponse.redirect(result.url);
}
