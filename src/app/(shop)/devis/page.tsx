"use client";

import * as React from "react";
import { Building2, CheckCircle2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitQuoteRequestAction } from "@/lib/actions/quote";

export default function DevisPage() {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);

    const res = await submitQuoteRequestAction({
      companyName: String(fd.get("companyName") ?? ""),
      ninea: String(fd.get("ninea") ?? ""),
      contactName: String(fd.get("contactName") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      message: String(fd.get("message") ?? ""),
    });

    setPending(false);
    if (res.ok) {
      setDone(true);
    } else {
      setError(res.error ?? "Une erreur est survenue.");
    }
  }

  if (done) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-32 text-center">
        <CheckCircle2 className="h-12 w-12 text-[hsl(var(--accent))]" />
        <h1 className="text-2xl font-semibold">Demande envoyée</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Merci, votre demande de devis a bien été enregistrée. Notre équipe
          vous contactera rapidement pour établir votre offre.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <Building2 className="h-8 w-8 text-[hsl(var(--accent))]" />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Demander un devis</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Pour les entreprises et administrations : commande sur bon de
            commande / facture, sans paiement à la livraison.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Nom de l&apos;entreprise
          </label>
          <Input name="companyName" required placeholder="Ex. Société XYZ SARL" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            NINEA / ICE (optionnel)
          </label>
          <Input name="ninea" placeholder="0000000000000" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Nom du contact</label>
            <Input name="contactName" required placeholder="Ex. Awa Ndiaye" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Téléphone</label>
            <Input name="phone" required placeholder="+221 77 000 00 00" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">E-mail (optionnel)</label>
          <Input name="email" type="email" placeholder="vous@entreprise.com" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Votre besoin (optionnel)
          </label>
          <Textarea
            name="message"
            className="min-h-28"
            placeholder="Équipements souhaités, quantités, délai…"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Envoi…" : "Envoyer la demande"}
        </Button>
      </form>
    </div>
  );
}
