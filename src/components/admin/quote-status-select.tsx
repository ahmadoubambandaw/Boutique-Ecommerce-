"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { setQuoteRequestStatusAction } from "@/lib/actions/admin-commerce";
import type { QuoteRequestStatus } from "@/lib/commerce/types";

const OPTIONS: { value: QuoteRequestStatus; label: string }[] = [
  { value: "new", label: "Nouvelle" },
  { value: "contacted", label: "Contactée" },
  { value: "closed", label: "Clôturée" },
];

export function QuoteStatusSelect({
  id,
  status,
  disabled,
}: {
  id: string;
  status: QuoteRequestStatus;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setPending(true);
    const res = await setQuoteRequestStatusAction(id, next);
    setPending(false);
    if (res.ok) router.refresh();
  }

  return (
    <select
      defaultValue={status}
      onChange={onChange}
      disabled={disabled || pending}
      className="rounded-full border border-[hsl(var(--border))] bg-transparent px-3 py-1.5 text-sm disabled:opacity-50"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
