import { NextResponse } from "next/server";
import { createBillingPortal } from "@/lib/stripe/billing";
import { resolveTenant } from "@/lib/tenant/registry";
import { appUrl } from "@/lib/urls";

/** Redirect the current tenant to the Stripe Billing Portal. */
export async function GET() {
  const tenant = await resolveTenant();
  const base = appUrl();

  // In production this id lives on the tenant row (stripeCustomerId).
  const stripeCustomerId = (tenant as { stripeCustomerId?: string })
    .stripeCustomerId;

  if (!stripeCustomerId) {
    return NextResponse.redirect(new URL("/pricing", base));
  }

  const result = await createBillingPortal(stripeCustomerId);
  if ("error" in result) {
    return NextResponse.redirect(new URL("/admin/settings?billing=error", base));
  }
  return NextResponse.redirect(result.url);
}
