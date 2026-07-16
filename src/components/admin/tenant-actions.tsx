"use client";

import * as React from "react";
import { MoreHorizontal, Pause, Play, Trash2 } from "lucide-react";

/**
 * Super-Admin row actions. Wire these to server actions that call Stripe
 * (pause/cancel subscription) and the tenant registry (suspend/delete).
 */
export function TenantActions({
  tenantId,
  suspended,
}: {
  tenantId: string;
  suspended: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
        aria-label="Actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="glass-strong absolute right-0 z-10 mt-1 w-44 rounded-xl border border-[hsl(var(--border))] p-1 text-left shadow-xl">
          <button
            onClick={() => alert(`${suspended ? "Réactiver" : "Suspendre"} ${tenantId}`)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[hsl(var(--muted))]"
          >
            {suspended ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {suspended ? "Réactiver" : "Suspendre"}
          </button>
          <button
            onClick={() => alert(`Supprimer ${tenantId}`)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-[hsl(var(--muted))]"
          >
            <Trash2 className="h-4 w-4" /> Supprimer
          </button>
        </div>
      )}
    </div>
  );
}
