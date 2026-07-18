import type { Metadata } from "next";
import { isLocalPaymentConfigured } from "@/lib/payments";
import { hasAdminApi } from "@/lib/shopify/orders";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Paiement",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [mobileMoneyReady, ordersReady] = await Promise.all([
    Promise.resolve(isLocalPaymentConfigured()),
    hasAdminApi(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight sm:text-4xl">
        Finaliser la commande
      </h1>
      <CheckoutForm mobileMoneyReady={mobileMoneyReady} ordersReady={ordersReady} />
    </div>
  );
}
