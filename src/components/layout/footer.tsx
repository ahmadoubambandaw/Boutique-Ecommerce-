import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Newsletter } from "./newsletter";
import { CONTACT } from "@/lib/contact";

const COLUMNS = [
  {
    title: "Boutique",
    links: [
      { label: "Catalogue", href: "/products" },
      { label: "Collections", href: "/collections" },
      { label: "Nouveautés", href: "/collections/nouveautes" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  {
    title: "Aide",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Suivi de commande", href: "/track" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { label: "À propos", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Conditions générales", href: "/terms" },
      { label: "Confidentialité", href: "/privacy" },
    ],
  },
];

export function Footer({ storeName = "GSE" }: { storeName?: string }) {
  return (
    <footer className="mt-24 border-t border-[hsl(var(--border))]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <p className="text-2xl font-semibold tracking-tight">
              {storeName}
              <span className="text-[hsl(var(--brand-red))]">.</span>
            </p>
            <p className="mt-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
              {CONTACT.tagline}
            </p>
            <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
              Équipements de protection individuelle (EPI) et solutions de
              sécurité incendie.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
              <li>
                <a
                  href={`tel:${CONTACT.phoneTel}`}
                  className="flex items-center gap-2 hover:text-[hsl(var(--foreground))]"
                >
                  <Phone className="h-4 w-4" /> {CONTACT.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center gap-2 hover:text-[hsl(var(--foreground))]"
                >
                  <Mail className="h-4 w-4" /> {CONTACT.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {CONTACT.address}
              </li>
            </ul>
            <div className="mt-6 max-w-sm">
              <Newsletter />
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-semibold">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[hsl(var(--border))] pt-8 text-sm text-[hsl(var(--muted-foreground))] sm:flex-row">
          <p>
            © {new Date().getFullYear()} {CONTACT.name}. Tous droits réservés.
          </p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            Paiement à la livraison & mobile money
          </p>
        </div>
      </div>
    </footer>
  );
}
