"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CompareItem = {
  handle: string;
  title: string;
  image: string | null;
  price: string;
  currencyCode: string;
  vendor: string;
  productType: string;
};

type CompareState = {
  items: CompareItem[];
  toggle: (item: CompareItem) => void;
  remove: (handle: string) => void;
  has: (handle: string) => boolean;
  clear: () => void;
};

const MAX = 4;

/** Product comparator — up to 4 products side by side. */
export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) =>
        set((state) => {
          if (state.items.some((i) => i.handle === item.handle)) {
            return { items: state.items.filter((i) => i.handle !== item.handle) };
          }
          if (state.items.length >= MAX) return state;
          return { items: [...state.items, item] };
        }),
      remove: (handle) =>
        set((state) => ({
          items: state.items.filter((i) => i.handle !== handle),
        })),
      has: (handle) => get().items.some((i) => i.handle === handle),
      clear: () => set({ items: [] }),
    }),
    { name: "boutique-compare" },
  ),
);
