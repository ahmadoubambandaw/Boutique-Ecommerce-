"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerAction, type AuthState } from "@/lib/auth/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Création…" : "Créer mon compte"}
    </Button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useActionState<AuthState, FormData>(registerAction, {});

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Créer un compte</h1>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        Rejoignez-nous pour une expérience personnalisée.
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Prénom</label>
            <Input name="firstName" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Nom</label>
            <Input name="lastName" required />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">E-mail</label>
          <Input name="email" type="email" required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Mot de passe</label>
          <Input name="password" type="password" required minLength={8} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Confirmer le mot de passe</label>
          <Input name="confirmPassword" type="password" required minLength={8} />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input
            name="acceptTerms"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 accent-[hsl(var(--accent))]"
          />
          <span className="text-[hsl(var(--muted-foreground))]">
            J'accepte les{" "}
            <Link href="/terms" className="underline">conditions générales</Link> et la{" "}
            <Link href="/privacy" className="underline">politique de confidentialité</Link>.
          </span>
        </label>
        {state.error && (
          <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-500">
            {state.error}
          </p>
        )}
        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-[hsl(var(--foreground))] underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
