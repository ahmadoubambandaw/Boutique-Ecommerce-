"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to your monitoring service (Sentry, etc.).
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Une erreur est survenue</h1>
      <p className="max-w-md text-[hsl(var(--muted-foreground))]">
        Désolé, quelque chose s'est mal passé. Vous pouvez réessayer.
      </p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
