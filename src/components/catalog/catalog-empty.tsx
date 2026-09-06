import Link from "next/link";
import { PackageSearch, MessageCircle, Phone } from "lucide-react";
import { CONTACT, waLink } from "@/lib/contact";

/**
 * Shown whenever a catalogue query comes back with nothing — an empty shop, a
 * filter with no match, or (the important case) a database outage. A blank page
 * loses the customer; this keeps a way to reach the shop by WhatsApp or phone.
 */
export function CatalogEmpty({
  title = "Aucun produit à afficher pour le moment",
  message = "Notre catalogue est en cours de mise à jour. Contactez-nous directement, nous vous répondons tout de suite.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-14 text-center">
      <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--muted))]">
        <PackageSearch className="h-7 w-7 text-[hsl(var(--muted-foreground))]" />
      </span>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{message}</p>

      <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <MessageCircle className="h-4 w-4" />
          Écrire sur WhatsApp
        </a>
        <a
          href={`tel:${CONTACT.phoneTel}`}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[hsl(var(--border))] px-5 py-3 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))]"
        >
          <Phone className="h-4 w-4" />
          {CONTACT.phone}
        </a>
      </div>

      <Link
        href="/"
        className="mt-6 text-sm text-[hsl(var(--muted-foreground))] underline underline-offset-4 hover:text-[hsl(var(--foreground))]"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
