import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { mapStripeStatus, planForPriceId } from "@/lib/stripe/billing";
import { updateSubscription } from "@/lib/tenant/repository";

/**
 * Stripe webhook receiver. Verifies the signature, then keeps each tenant's
 * subscription plan/status in sync with Stripe (the billing source of truth).
 *
 * Configure the endpoint in Stripe → Developers → Webhooks, subscribing to:
 *   checkout.session.completed, customer.subscription.updated,
 *   customer.subscription.deleted, invoice.payment_failed
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "not-configured" }, { status: 501 });
  }

  const signature = request.headers.get("stripe-signature") ?? "";
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    return NextResponse.json(
      { error: `Signature invalide: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const item = sub.items.data[0];
      const priceId = item?.price.id ?? "";
      const plan = planForPriceId(priceId) ?? undefined;
      // In recent API versions the period boundary lives on the subscription item.
      const periodEnd = item?.current_period_end;
      await updateSubscription(sub.customer as string, {
        plan,
        status: mapStripeStatus(sub.status),
        stripeSubscriptionId: sub.id,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      });
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.customer) {
        await updateSubscription(invoice.customer as string, {
          status: "past_due",
        });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
