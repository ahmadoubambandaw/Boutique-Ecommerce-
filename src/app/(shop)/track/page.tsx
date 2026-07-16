"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Package, Truck } from "lucide-react";
import { trackOrderSchema, type TrackOrderInput } from "@/lib/validations";
import { MOCK_ORDERS, type Order } from "@/lib/mock/orders";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function TrackPage() {
  const [order, setOrder] = React.useState<Order | null>(null);
  const [notFound, setNotFound] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TrackOrderInput>({ resolver: zodResolver(trackOrderSchema) });

  const onSubmit = async (data: TrackOrderInput) => {
    await new Promise((r) => setTimeout(r, 500));
    // Integration point: Shopify Admin API order lookup by name + email.
    const match = MOCK_ORDERS.find(
      (o) => o.number.replace("#", "") === data.orderNumber.replace("#", ""),
    );
    setOrder(match ?? null);
    setNotFound(!match);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <div className="mb-8 text-center">
        <Truck className="mx-auto mb-4 h-10 w-10" />
        <h1 className="text-3xl font-semibold tracking-tight">Suivre ma commande</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          Entrez votre numéro de commande et votre e-mail.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input placeholder="Numéro de commande (ex : 1042)" {...register("orderNumber")} />
          {errors.orderNumber && (
            <p className="mt-1 text-xs text-red-500">{errors.orderNumber.message}</p>
          )}
        </div>
        <div>
          <Input type="email" placeholder="E-mail" {...register("email")} />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Recherche…" : "Suivre"}
        </Button>
      </form>

      {notFound && (
        <p className="mt-6 rounded-xl bg-[hsl(var(--muted))] px-4 py-3 text-sm">
          Aucune commande trouvée. Essayez « 1042 » pour la démo.
        </p>
      )}

      {order?.tracking && (
        <div className="mt-8 rounded-3xl border border-[hsl(var(--border))] p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="font-medium">Commande {order.number}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {order.tracking.carrier} · {order.tracking.number}
              </p>
            </div>
            <Package className="h-8 w-8" />
          </div>
          <ol className="space-y-4">
            {order.tracking.steps.map((step, i) => (
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
        </div>
      )}
    </div>
  );
}
