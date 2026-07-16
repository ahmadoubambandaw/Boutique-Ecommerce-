import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = { title: "Hors ligne" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <WifiOff className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
      <h1 className="text-2xl font-semibold">Vous êtes hors ligne</h1>
      <p className="max-w-sm text-[hsl(var(--muted-foreground))]">
        Impossible de charger cette page. Vérifiez votre connexion — les pages
        déjà visitées restent disponibles.
      </p>
      <Link
        href="/"
        className="inline-flex h-11 items-center rounded-full bg-[hsl(var(--accent))] px-6 text-sm font-medium text-[hsl(var(--accent-foreground))]"
      >
        Réessayer
      </Link>
    </div>
  );
}
