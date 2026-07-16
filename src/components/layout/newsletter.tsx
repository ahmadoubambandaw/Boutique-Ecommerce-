"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";
import {
  subscribeNewsletterAction,
  type NewsletterState,
} from "@/lib/actions/newsletter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "…" : "S'inscrire"}
    </Button>
  );
}

export function Newsletter() {
  const [state, formAction] = useActionState<NewsletterState, FormData>(
    subscribeNewsletterAction,
    {},
  );

  if (state.ok) {
    return (
      <p className="flex items-center gap-2 text-sm">
        <Check className="h-4 w-4" /> Merci ! Vous êtes inscrit·e.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <div className="flex gap-2">
        <Input
          name="email"
          type="email"
          required
          placeholder="Votre e-mail"
          aria-label="Adresse e-mail"
        />
        <SubmitButton />
      </div>
      {state.error && <p className="text-xs text-red-500">{state.error}</p>}
    </form>
  );
}
