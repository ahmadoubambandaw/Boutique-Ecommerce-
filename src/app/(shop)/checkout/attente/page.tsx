import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Paiement en cours",
  robots: { index: false, follow: false },
};

export default function PendingPaymentPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 px-4 py-24 text-center">
      <Clock className="h-16 w-16 text-amber-500" />
      <h1 className="text-3xl font-semibold tracking-tight">
        Paiement en attente
      </h1>
      <p className="text-[hsl(var(--muted-foreground))]">
        Votre paiement mobile money est en cours de confirmation. Validez la
        transaction sur votre téléphone si ce n'est pas déjà fait, puis
        actualisez cette page.
      </p>
      <div className="flex gap-3">
        <a
          href="/api/payments/callback"
          className="inline-flex h-11 items-center rounded-full bg-[hsl(var(--accent))] px-6 text-sm font-medium text-[hsl(var(--accent-foreground))]"
        >
          J'ai payé — vérifier
        </a>
        <Link
          href="/checkout"
          className="inline-flex h-11 items-center rounded-full border border-[hsl(var(--border))] px-6 text-sm font-medium hover:bg-[hsl(var(--muted))]"
        >
          Réessayer
        </Link>
      </div>
    </div>
  );
}
