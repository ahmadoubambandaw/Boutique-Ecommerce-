"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Lock } from "lucide-react";
import { adminLoginAction, type AdminAuthState } from "@/lib/auth/admin-actions";
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

export default function AdminLoginPage() {
  const [state, formAction] = useActionState<AdminAuthState, FormData>(
    adminLoginAction,
    {},
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Boutique<span className="text-[hsl(var(--muted-foreground))]">.admin</span>
          </h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Accès réservé aux administrateurs.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">E-mail</label>
            <Input name="email" type="email" required placeholder="admin@exemple.com" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Mot de passe</label>
            <Input name="password" type="password" required />
          </div>
          {state.error && (
            <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-500">
              {state.error}
            </p>
          )}
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
