"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Client cart store.
 *
 * Drives the cart UI with instant, optimistic updates and animations. On
 * checkout it hands the line items to Shopify (via a server action) to create a
 * real Cart and redirect to Shopify's secure checkout — so pricing, taxes,
 * discounts and payment always resolve against Shopify, the source of truth.
 */

export type CartLineItem = {
  /** Shopify variant gid — used to build the real Shopify cart at checkout. */
  variantId: string;
  handle: string;
  title: string;
  variantTitle: string;
  image: string | null;
  price: string;
  currencyCode: string;
  quantity: number;
};

type CartState = {
  lines: CartLineItem[];
  isOpen: boolean;
  add: (line: Omit<CartLineItem, "quantity">, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
  totalQuantity: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      add: (line, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find(
            (l) => l.variantId === line.variantId,
          );
          if (existing) {
            return {
              isOpen: true,
              lines: state.lines.map((l) =>
                l.variantId === line.variantId
                  ? { ...l, quantity: l.quantity + quantity }
                  : l,
              ),
            };
          }
          return { isOpen: true, lines: [...state.lines, { ...line, quantity }] };
        }),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.variantId !== variantId)
              : state.lines.map((l) =>
                  l.variantId === variantId ? { ...l, quantity } : l,
                ),
        })),
      remove: (variantId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.variantId !== variantId),
        })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setOpen: (isOpen) => set({ isOpen }),
      totalQuantity: () => get().lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: () =>
        get().lines.reduce((n, l) => n + parseFloat(l.price) * l.quantity, 0),
    }),
    {
      name: "boutique-cart",
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);
