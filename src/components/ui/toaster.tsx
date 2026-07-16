"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Info, X, AlertCircle } from "lucide-react";
import { useToast } from "@/lib/store/toast";

const ICONS = {
  success: Check,
  error: AlertCircle,
  default: Info,
} as const;

/** Renders the toast queue, bottom-center, above the compare bar. */
export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[90] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.variant];
          const body = (
            <>
              <Icon
                className={
                  t.variant === "success"
                    ? "h-4 w-4 text-green-500"
                    : t.variant === "error"
                      ? "h-4 w-4 text-red-500"
                      : "h-4 w-4"
                }
              />
              <span className="text-sm font-medium">{t.message}</span>
            </>
          );
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
              className="glass-strong pointer-events-auto flex items-center gap-3 rounded-full border border-[hsl(var(--border))] py-2.5 pl-4 pr-2 shadow-xl"
            >
              {t.href ? (
                <Link href={t.href} onClick={() => dismiss(t.id)} className="flex items-center gap-3">
                  {body}
                </Link>
              ) : (
                <span className="flex items-center gap-3">{body}</span>
              )}
              <button
                onClick={() => dismiss(t.id)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
                aria-label="Fermer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
