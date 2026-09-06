"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

/**
 * Copies the subscriber list to the clipboard, comma-separated, ready to paste
 * into a mail client's Cci field or an emailing tool.
 */
export function CopyEmailsButton({ emails }: { emails: string[] }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(emails.join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused (insecure context, permission denied);
      // leaving the button idle is better than a broken success state.
    }
  };

  return (
    <button
      onClick={copy}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-[hsl(var(--border))] px-4 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))]"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" /> Copié
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" /> Copier les {emails.length} e-mails
        </>
      )}
    </button>
  );
}
