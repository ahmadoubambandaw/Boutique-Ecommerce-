"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { LOCALES } from "@/lib/i18n/dictionary";
import { useLocaleStore } from "@/lib/store/locale";
import { CURRENCIES, useCurrency } from "@/lib/store/currency";
import { cn } from "@/lib/utils";

/** Language + currency picker (persisted, client-side). */
export function LocaleSwitcher() {
  const [open, setOpen] = React.useState(false);
  const { locale, setLocale } = useLocaleStore();
  const { currency, setCurrency } = useCurrency();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm hover:bg-[hsl(var(--muted))]"
        aria-label="Langue et devise"
      >
        <Globe className="h-5 w-5" />
        <span className="hidden text-xs font-medium sm:inline">
          {mounted ? `${locale.toUpperCase()} · ${currency}` : "FR · EUR"}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="glass-strong absolute right-0 z-50 mt-1 w-56 rounded-2xl border border-[hsl(var(--border))] p-3 shadow-xl"
          >
            <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Langue
            </p>
            <div className="mb-3 flex flex-col gap-0.5">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  onMouseDown={() => setLocale(l.code)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[hsl(var(--muted))]",
                    locale === l.code && "font-semibold",
                  )}
                >
                  <span>{l.flag}</span> {l.label}
                </button>
              ))}
            </div>
            <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Devise
            </p>
            <div className="grid grid-cols-2 gap-1">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onMouseDown={() => setCurrency(c.code)}
                  className={cn(
                    "rounded-lg px-2 py-1.5 text-left text-sm hover:bg-[hsl(var(--muted))]",
                    currency === c.code && "font-semibold",
                  )}
                >
                  {c.symbol} {c.code}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
