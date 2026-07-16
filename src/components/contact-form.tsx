"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/validations";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [done, setDone] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (_data: ContactInput) => {
    // Integration point: send to your support inbox / helpdesk / Shopify.
    await new Promise((r) => setTimeout(r, 700));
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-[hsl(var(--border))] p-10 text-center">
        <Check className="h-10 w-10" />
        <h2 className="text-xl font-semibold">Message envoyé</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Merci ! Notre équipe vous répondra sous 24h.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Nom</label>
          <Input {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">E-mail</label>
          <Input type="email" {...register("email")} />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Sujet</label>
        <Input {...register("subject")} />
        {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Message</label>
        <Textarea {...register("message")} />
        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
      </div>
      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Envoi…" : "Envoyer le message"}
      </Button>
    </form>
  );
}
