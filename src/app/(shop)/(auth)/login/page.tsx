"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type AuthState } from "@/lib/auth/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Connexion…" : "Se connecter"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState<AuthState, FormData>(loginAction, {});

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Connexion</h1>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        Accédez à votre compte, vos commandes et vos favoris.
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">E-mail</label>
          <Input name="email" type="email" required placeholder="vous@exemple.com" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Mot de passe</label>
          <Input name="password" type="password" required placeholder="••••••••" />
        </div>
        {state.error && (
          <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-500">
            {state.error}
          </p>
        )}
        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-medium text-[hsl(var(--foreground))] underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
