"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, ExternalLink, Package, Truck } from "lucide-react";
import { trackOrderAction, type TrackingResult } from "@/lib/actions/orders";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Recherche…" : "Suivre"}
    </Button>
  );
}

export default function TrackPage() {
  const [state, formAction] = useActionState<TrackingResult, FormData>(
    trackOrderAction,
    { found: false },
  );

  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <div className="mb-8 text-center">
        <Truck className="mx-auto mb-4 h-10 w-10" />
        <h1 className="text-3xl font-semibold tracking-tight">Suivre ma commande</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          Entrez votre numéro de commande et votre e-mail.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <Input name="orderNumber" placeholder="Numéro de commande (ex : 1042)" required />
        <Input name="email" type="email" placeholder="E-mail" required />
        <SubmitButton />
      </form>

      {state.error && (
        <p className="mt-6 rounded-xl bg-[hsl(var(--muted))] px-4 py-3 text-sm">
          {state.error}
        </p>
      )}

      {state.found && state.steps && (
        <div className="mt-8 rounded-3xl border border-[hsl(var(--border))] p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="font-medium">Commande {state.orderNumber}</p>
              {state.carrier && (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {state.carrier}
                  {state.trackingNumber ? ` · ${state.trackingNumber}` : ""}
                </p>
              )}
            </div>
            <Package className="h-8 w-8" />
          </div>
          <ol className="space-y-4">
            {state.steps.map((step, i) => (
              <li key={i} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                    step.done
                      ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                      : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]",
                  )}
                >
                  {step.done ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className={cn("text-sm", !step.done && "text-[hsl(var(--muted-foreground))]")}>
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
          {state.trackingUrl && (
            <a
              href={state.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium underline"
            >
              Suivre chez le transporteur <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
