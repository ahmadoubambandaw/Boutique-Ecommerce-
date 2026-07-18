"use client";

import * as React from "react";
import { useActionState } from "react";
import { updateAdminAccountAction } from "@/lib/auth/admin-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AccountForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(updateAdminAccountAction, {});

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Adresse e-mail (identifiant de connexion)
        </label>
        <Input
          name="email"
          type="email"
          defaultValue={email}
          autoComplete="username"
          placeholder="vous@exemple.com"
        />
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          C&apos;est l&apos;adresse avec laquelle vous vous connectez.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Nouveau mot de passe
          </label>
          <Input
            name="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Laisser vide pour ne pas changer"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Confirmer le mot de passe
          </label>
          <Input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Retaper le mot de passe"
          />
        </div>
      </div>

      <div className="border-t border-[hsl(var(--border))] pt-5">
        <label className="mb-1.5 block text-sm font-medium">
          Mot de passe actuel (obligatoire pour valider)
        </label>
        <Input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Votre mot de passe actuel"
          className="sm:max-w-sm"
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
          Vos identifiants ont été mis à jour.
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
