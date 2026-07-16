"use client";

import { create } from "zustand";

export type ToastVariant = "default" | "success" | "error";
export type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
  href?: string;
};

type ToastState = {
  toasts: Toast[];
  push: (message: string, opts?: { variant?: ToastVariant; href?: string }) => void;
  dismiss: (id: number) => void;
};

let counter = 0;

/** Lightweight in-app notification (toast) queue. */
export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (message, opts) => {
    const id = ++counter;
    set((s) => ({
      toasts: [...s.toasts, { id, message, variant: opts?.variant ?? "default", href: opts?.href }],
    }));
    // Auto-dismiss after 3.5s.
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Convenience helpers. */
export const toast = {
  success: (m: string, href?: string) => useToast.getState().push(m, { variant: "success", href }),
  error: (m: string) => useToast.getState().push(m, { variant: "error" }),
  info: (m: string, href?: string) => useToast.getState().push(m, { href }),
};
