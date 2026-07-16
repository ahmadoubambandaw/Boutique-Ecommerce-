"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (_data: LoginInput) => {
    // Integration point: Shopify Customer Account API (OAuth / token exchange).
    await new Promise((r) => setTimeout(r, 700));
    setError("root", {
      message:
        "Démo : connectez l'API Customer Account de Shopify pour l'authentification réelle.",
    });
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Connexion</h1>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        Accédez à votre compte, vos commandes et vos favoris.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">E-mail</label>
          <Input type="email" placeholder="vous@exemple.com" {...register("email")} />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Mot de passe</label>
          <Input type="password" placeholder="••••••••" {...register("password")} />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>
        {errors.root && (
          <p className="rounded-xl bg-[hsl(var(--muted))] px-3 py-2 text-xs">
            {errors.root.message}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Connexion…" : "Se connecter"}
        </Button>
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
