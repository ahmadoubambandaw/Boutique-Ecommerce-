"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (_data: RegisterInput) => {
    // Integration point: Shopify customerCreate mutation (Storefront/Customer API).
    await new Promise((r) => setTimeout(r, 700));
    setError("root", {
      message: "Démo : branchez la mutation Shopify customerCreate ici.",
    });
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Créer un compte</h1>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        Rejoignez-nous pour une expérience personnalisée.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Prénom</label>
            <Input {...register("firstName")} />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Nom</label>
            <Input {...register("lastName")} />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">E-mail</label>
          <Input type="email" {...register("email")} />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Mot de passe</label>
          <Input type="password" {...register("password")} />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Confirmer le mot de passe</label>
          <Input type="password" {...register("confirmPassword")} />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            {...register("acceptTerms")}
            className="mt-0.5 h-4 w-4 accent-[hsl(var(--accent))]"
          />
          <span className="text-[hsl(var(--muted-foreground))]">
            J'accepte les{" "}
            <Link href="/terms" className="underline">conditions générales</Link> et la{" "}
            <Link href="/privacy" className="underline">politique de confidentialité</Link>.
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-xs text-red-500">{errors.acceptTerms.message}</p>
        )}
        {errors.root && (
          <p className="rounded-xl bg-[hsl(var(--muted))] px-3 py-2 text-xs">
            {errors.root.message}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Création…" : "Créer mon compte"}
        </Button>
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
