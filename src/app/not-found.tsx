import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-indigo-400/20 to-rose-400/10 blur-3xl" />
      </div>
      <div className="text-center">
        <p className="text-[10rem] font-semibold leading-none tracking-tighter sm:text-[14rem]">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Page introuvable</h1>
        <p className="mx-auto mt-2 max-w-md text-[hsl(var(--muted-foreground))]">
          La page que vous recherchez a peut-être été déplacée ou n'existe plus.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-6 text-sm font-medium text-[hsl(var(--accent-foreground))]"
          >
            <Home className="h-4 w-4" /> Retour à l'accueil
          </Link>
          <Link
            href="/products"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[hsl(var(--border))] px-6 text-sm font-medium hover:bg-[hsl(var(--muted))]"
          >
            <Search className="h-4 w-4" /> Voir le catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
