import Link from "next/link";
import { Newsletter } from "./newsletter";

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
      { label: "Mon compte", href: "/account" },
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

export function Footer({ storeName = "Boutique" }: { storeName?: string }) {
  return (
    <footer className="mt-24 border-t border-[hsl(var(--border))]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <p className="text-2xl font-semibold tracking-tight">
              {storeName}<span className="text-[hsl(var(--muted-foreground))]">.</span>
            </p>
            <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
              L'expérience d'achat headless, plus rapide et élégante. Recevez nos
              nouveautés et offres exclusives.
            </p>
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
            © {new Date().getFullYear()} {storeName}. Propulsé par Shopify &
            Next.js.
          </p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            Paiement sécurisé
          </p>
        </div>
      </div>
    </footer>
  );
}
