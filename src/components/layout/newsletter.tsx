"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { newsletterSchema, type NewsletterInput } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Newsletter() {
  const [done, setDone] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput>({ resolver: zodResolver(newsletterSchema) });

  const onSubmit = async (_data: NewsletterInput) => {
    // Wire to Shopify customer marketing consent / your ESP here.
    await new Promise((r) => setTimeout(r, 600));
    setDone(true);
  };

  if (done) {
    return (
      <p className="flex items-center gap-2 text-sm">
        <Check className="h-4 w-4" /> Merci ! Vous êtes inscrit·e.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Votre e-mail"
          aria-label="Adresse e-mail"
          {...register("email")}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "…" : "S'inscrire"}
        </Button>
      </div>
      {errors.email && (
        <p className="text-xs text-red-500">{errors.email.message}</p>
      )}
    </form>
  );
}
