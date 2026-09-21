"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2, CheckCircle2, Download, PackageSearch } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/store/cart";
import { submitQuoteRequestAction } from "@/lib/actions/quote";

export default function DevisPage() {
  const { lines } = useCart();
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [quoteId, setQuoteId] = React.useState<string | null>(null);

  // Select every cart item by default the first time the cart is read
  // (client-side store hydrates after mount, so this can't be initial state).
  const initialized = React.useRef(false);
  React.useEffect(() => {
    if (initialized.current || lines.length === 0) return;
    initialized.current = true;
    setSelected(Object.fromEntries(lines.map((l) => [l.variantId, true])));
  }, [lines]);

  function toggle(variantId: string) {
    setSelected((s) => ({ ...s, [variantId]: !s[variantId] }));
  }

  const selectedLines = lines.filter((l) => selected[l.variantId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);

    const items = selectedLines.map((l) => ({
      productId: l.handle,
      handle: l.handle,
      title: l.title,
      variantTitle: l.variantTitle,
      price: parseFloat(l.price),
      quantity: l.quantity,
      image: l.image,
    }));

    const res = await submitQuoteRequestAction(
      {
        companyName: String(fd.get("companyName") ?? ""),
        ninea: String(fd.get("ninea") ?? ""),
        contactName: String(fd.get("contactName") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        email: String(fd.get("email") ?? ""),
        message: String(fd.get("message") ?? ""),
      },
      items,
    );

    setPending(false);
    if (res.ok && res.quoteId) {
      setQuoteId(res.quoteId);
    } else {
      setError(res.error ?? "Une erreur est survenue.");
    }
  }

  if (quoteId) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-32 text-center">
        <CheckCircle2 className="h-12 w-12 text-[hsl(var(--accent))]" />
        <h1 className="text-2xl font-semibold">Demande envoyée</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Merci, votre demande de devis a bien été enregistrée. Notre équipe
          vous contactera rapidement pour établir votre offre.
        </p>
        <a
          href={`/api/proforma/quote/${quoteId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex h-11 items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-6 text-sm font-medium text-[hsl(var(--accent-foreground))] transition-opacity hover:opacity-90"
        >
          <Download className="h-4 w-4" />
          Télécharger le devis (PDF)
        </a>
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
        <section>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Produits souhaités</label>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-xs text-[hsl(var(--accent))] hover:underline"
            >
              <PackageSearch className="h-3.5 w-3.5" />
              Parcourir le catalogue
            </Link>
          </div>

          {lines.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-4 text-sm text-[hsl(var(--muted-foreground))]">
              Ajoutez des produits à votre panier en parcourant le catalogue —
              ils apparaîtront ici automatiquement, prêts à être inclus dans
              votre demande. Vous pouvez aussi décrire votre besoin librement
              ci-dessous.
            </div>
          ) : (
            <ul className="divide-y divide-[hsl(var(--border))] rounded-2xl border border-[hsl(var(--border))]">
              {lines.map((l) => (
                <li key={l.variantId} className="flex items-center gap-3 p-3">
                  <input
                    type="checkbox"
                    checked={Boolean(selected[l.variantId])}
                    onChange={() => toggle(l.variantId)}
                    className="h-4 w-4 shrink-0 accent-[hsl(var(--accent))]"
                  />
                  <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-[hsl(var(--muted))]">
                    {l.image && (
                      <Image src={l.image} alt={l.title} fill sizes="40px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{l.title}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {l.variantTitle} × {l.quantity}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

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
            Précisions supplémentaires (optionnel)
          </label>
          <Textarea
            name="message"
            className="min-h-24"
            placeholder="Quantités, délai souhaité, autres besoins…"
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
