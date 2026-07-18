import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { ClearCartOnMount } from "@/components/checkout/clear-cart";

export const metadata: Metadata = {
  title: "Commande confirmée",
  robots: { index: false, follow: false },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; paid?: string }>;
}) {
  const { order, paid } = await searchParams;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 px-4 py-24 text-center">
      <ClearCartOnMount />
      <CheckCircle2 className="h-16 w-16 text-green-500" />
      <h1 className="text-3xl font-semibold tracking-tight">
        Merci pour votre commande !
      </h1>
      {order && (
        <p className="text-lg">
          Commande <strong>{order}</strong> confirmée.
        </p>
      )}
      <p className="text-[hsl(var(--muted-foreground))]">
        {paid
          ? "Votre paiement mobile money a bien été reçu. Nous préparons votre commande et vous contacterons pour la livraison."
          : "Nous vous contacterons par téléphone pour confirmer la livraison. Le paiement s'effectuera à la réception."}
      </p>
      <Link
        href="/products"
        className="mt-2 inline-flex h-11 items-center rounded-full bg-[hsl(var(--accent))] px-6 text-sm font-medium text-[hsl(var(--accent-foreground))]"
      >
        Continuer mes achats
      </Link>
    </div>
  );
}
