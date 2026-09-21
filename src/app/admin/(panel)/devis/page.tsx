import { listQuoteRequests } from "@/lib/commerce/repository";
import { isDbConfigured } from "@/lib/db/client";
import { QuoteStatusSelect } from "@/components/admin/quote-status-select";

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminDevisPage() {
  const quotes = await listQuoteRequests();
  const readOnly = !isDbConfigured();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Demandes de devis
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {quotes.length} demande{quotes.length > 1 ? "s" : ""}
        </p>
      </div>

      {readOnly && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          Mode démo : connectez une base de données pour recevoir de vraies
          demandes de devis.
        </div>
      )}

      {quotes.length === 0 ? (
        <div className="rounded-2xl border border-[hsl(var(--border))] p-12 text-center text-[hsl(var(--muted-foreground))]">
          Aucune demande de devis pour le moment.
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((q) => (
            <div
              key={q.id}
              className="rounded-2xl border border-[hsl(var(--border))] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{q.companyName}</span>
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                      {formatDate(q.createdAt)}
                    </span>
                  </div>
                  {q.ninea && (
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      NINEA/ICE : {q.ninea}
                    </p>
                  )}
                  <p className="mt-1 text-sm">
                    {q.contactName} · {q.phone}
                    {q.email ? ` · ${q.email}` : ""}
                  </p>
                  {q.message && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[hsl(var(--muted-foreground))]">
                      {q.message}
                    </p>
                  )}
                </div>
                <QuoteStatusSelect id={q.id} status={q.status} disabled={readOnly} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
