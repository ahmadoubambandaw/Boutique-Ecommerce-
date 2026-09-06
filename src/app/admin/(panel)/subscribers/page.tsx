import { Mail } from "lucide-react";
import { listSubscribers } from "@/lib/commerce/newsletter";
import { isDbConfigured } from "@/lib/db/client";
import { AdminReveal } from "@/components/admin/admin-reveal";
import { CopyEmailsButton } from "@/components/admin/copy-emails-button";

export const dynamic = "force-dynamic";

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminSubscribersPage() {
  const subscribers = await listSubscribers();
  const readOnly = !isDbConfigured();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Abonnés</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {subscribers.length} inscrit{subscribers.length > 1 ? "s" : ""} à la
            newsletter
          </p>
        </div>
        {subscribers.length > 0 && (
          <CopyEmailsButton emails={subscribers.map((s) => s.email)} />
        )}
      </div>

      {readOnly && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          Mode démo : connectez une base de données pour collecter des inscrits.
        </div>
      )}

      {subscribers.length === 0 ? (
        <div className="rounded-2xl border border-[hsl(var(--border))] p-12 text-center">
          <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--muted))]">
            <Mail className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
          </span>
          <p className="text-[hsl(var(--muted-foreground))]">
            Aucun inscrit pour le moment. Le formulaire se trouve en bas de
            chaque page de la boutique.
          </p>
        </div>
      ) : (
        <AdminReveal>
          <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))]">
            <table className="w-full text-sm">
              <thead className="bg-[hsl(var(--muted))] text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">E-mail</th>
                  <th className="px-4 py-3 font-medium">Origine</th>
                  <th className="px-4 py-3 text-right font-medium">Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr
                    key={s.email}
                    className="border-t border-[hsl(var(--border))]"
                  >
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${s.email}`}
                        className="hover:underline"
                      >
                        {s.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                      {s.source}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[hsl(var(--muted-foreground))]">
                      {formatDate(s.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminReveal>
      )}
    </div>
  );
}
