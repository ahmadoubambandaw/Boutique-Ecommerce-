"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Banknote, ShoppingBag, Smartphone } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { formatPrice, cn } from "@/lib/utils";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  localCheckoutAction,
  type LocalCheckoutState,
} from "@/lib/actions/local-checkout";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Traitement…" : label}
    </Button>
  );
}

const FAIL_MESSAGES: Record<string, string> = {
  session: "Session de paiement expirée — veuillez recommencer.",
  payment: "Le paiement n'a pas abouti. Vous pouvez réessayer.",
  cart: "Panier invalide — veuillez recommencer.",
  error: "Une erreur est survenue pendant la confirmation. Réessayez.",
};

export function CheckoutForm({
  mobileMoneyReady,
  ordersReady,
}: {
  mobileMoneyReady: boolean;
  ordersReady: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lines, clear } = useCart();
  const [method, setMethod] = React.useState<"mobile_money" | "cod">(
    mobileMoneyReady ? "mobile_money" : "cod",
  );
  const [state, formAction] = useActionState<LocalCheckoutState, FormData>(
    localCheckoutAction,
    {},
  );

  const failed = searchParams.get("failed");
  const cancelled = searchParams.get("cancelled");

  const subtotal = lines.reduce((n, l) => n + parseFloat(l.price) * l.quantity, 0);
  const currency = lines[0]?.currencyCode ?? "XOF";

  // Redirect to the gateway, or to the confirmation for COD.
  React.useEffect(() => {
    if (state.redirectUrl) {
      window.location.href = state.redirectUrl;
    } else if (state.ok && state.orderName) {
      clear();
      router.push(`/checkout/merci?order=${encodeURIComponent(state.orderName)}`);
    }
  }, [state, clear, router]);

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <ShoppingBag className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
        <p className="text-[hsl(var(--muted-foreground))]">Votre panier est vide.</p>
        <Link
          href="/products"
          className="inline-flex h-11 items-center rounded-full bg-[hsl(var(--accent))] px-6 text-sm font-medium text-[hsl(var(--accent-foreground))]"
        >
          Voir le catalogue
        </Link>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="grid gap-10 lg:grid-cols-[1fr_380px]"
    >
      {/* Hidden cart payload: ids + quantities only (prices re-checked server-side). */}
      <input
        type="hidden"
        name="lines"
        value={JSON.stringify(
          lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
        )}
      />
      <input type="hidden" name="paymentMethod" value={method} />

      <div className="space-y-8">
        {(failed || cancelled) && (
          <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {cancelled
              ? "Paiement annulé — vous pouvez réessayer."
              : (FAIL_MESSAGES[failed ?? ""] ?? FAIL_MESSAGES.error)}
          </p>
        )}

        {/* Contact & delivery */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Livraison</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nom complet</label>
              <Input name="name" required placeholder="Prénom Nom" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Téléphone (Wave / Orange)
              </label>
              <Input name="phone" required placeholder="77 123 45 67" inputMode="tel" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Ville</label>
              <Input name="city" required placeholder="Dakar" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Adresse / quartier</label>
              <Input name="address" required placeholder="Ex : Sacré-Cœur 3, villa 123" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Note (optionnel)
            </label>
            <Textarea name="note" placeholder="Instructions de livraison…" />
          </div>
        </section>

        {/* Payment method */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Paiement</h2>

          <button
            type="button"
            onClick={() => mobileMoneyReady && setMethod("mobile_money")}
            disabled={!mobileMoneyReady}
            className={cn(
              "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors",
              method === "mobile_money"
                ? "border-[hsl(var(--accent))] bg-[hsl(var(--muted))]"
                : "border-[hsl(var(--border))]",
              !mobileMoneyReady && "opacity-50",
            )}
          >
            <Smartphone className="h-6 w-6 shrink-0" />
            <span>
              <span className="block font-medium">Wave / Orange Money</span>
              <span className="block text-sm text-[hsl(var(--muted-foreground))]">
                {mobileMoneyReady
                  ? "Paiement mobile sécurisé, confirmation instantanée"
                  : "Bientôt disponible"}
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMethod("cod")}
            className={cn(
              "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors",
              method === "cod"
                ? "border-[hsl(var(--accent))] bg-[hsl(var(--muted))]"
                : "border-[hsl(var(--border))]",
            )}
          >
            <Banknote className="h-6 w-6 shrink-0" />
            <span>
              <span className="block font-medium">Paiement à la livraison</span>
              <span className="block text-sm text-[hsl(var(--muted-foreground))]">
                Payez en espèces ou par Wave à la réception
              </span>
            </span>
          </button>
        </section>

        {!ordersReady && (
          <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm">
            Mode démo : la création de commandes nécessite le token Admin Shopify
            (write_orders).
          </p>
        )}
        {state.error && (
          <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {state.error}
          </p>
        )}
      </div>

      {/* Summary */}
      <aside className="h-fit space-y-4 rounded-3xl border border-[hsl(var(--border))] p-6 lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold">Votre commande</h2>
        <ul className="space-y-3">
          {lines.map((line) => (
            <li key={line.variantId} className="flex items-center gap-3">
              <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-[hsl(var(--muted))]">
                {line.image && (
                  <Image src={line.image} alt={line.title} fill sizes="48px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{line.title}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  × {line.quantity}
                </p>
              </div>
              <span className="text-sm tabular-nums">
                {formatPrice(parseFloat(line.price) * line.quantity, line.currencyCode)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-[hsl(var(--border))] pt-4 font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(subtotal, currency)}</span>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Livraison calculée à la confirmation. Le montant exact est vérifié côté
          serveur.
        </p>
        <SubmitButton
          label={
            method === "mobile_money"
              ? "Payer par Wave / Orange Money"
              : "Commander (payer à la livraison)"
          }
        />
      </aside>
    </form>
  );
}
