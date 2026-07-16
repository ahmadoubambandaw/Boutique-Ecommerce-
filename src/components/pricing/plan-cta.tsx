"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/lib/tenant/types";

/**
 * Plan CTA: starts a Stripe subscription checkout. If billing isn't configured
 * yet (or the merchant hasn't connected Shopify), it routes to the Shopify
 * OAuth onboarding so the flow is never a dead end.
 */
export function PlanCta({
  plan,
  featured,
}: {
  plan: SubscriptionPlan;
  featured: boolean;
}) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
        return;
      }
      // Billing not configured → send to Shopify onboarding instead.
      if (res.status === 501) {
        window.location.href = "/api/auth/shopify";
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Une erreur est survenue.");
    } catch {
      setError("Réseau indisponible. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={start}
        disabled={loading}
        className={cn(
          "mt-6 inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60",
          featured
            ? "bg-white text-black"
            : "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]",
        )}
      >
        {loading ? "Redirection…" : "Commencer l'essai"}
      </button>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </>
  );
}
