import { NextResponse } from "next/server";
import { z } from "zod";
import { createSubscriptionCheckout } from "@/lib/stripe/billing";
import { resolveTenant } from "@/lib/tenant/registry";
import { isStripeConfigured } from "@/lib/stripe/client";

const schema = z.object({
  plan: z.enum(["basic", "pro", "enterprise"]),
  email: z.string().email().optional(),
});

/** Start a subscription checkout for the active tenant. */
export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "La facturation Stripe n'est pas encore configurée." },
      { status: 501 },
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const tenant = await resolveTenant();
  const result = await createSubscriptionCheckout({
    plan: parsed.data.plan,
    tenantId: tenant.id,
    customerEmail: parsed.data.email,
    stripeCustomerId: null,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ url: result.url });
}
