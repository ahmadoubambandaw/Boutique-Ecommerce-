"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewedItem = {
  handle: string;
  title: string;
  image: string | null;
  price: string;
  currencyCode: string;
};

type RecentlyViewedState = {
  items: ViewedItem[];
  add: (item: ViewedItem) => void;
  clear: () => void;
};

const MAX = 8;

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((state) => {
          const next = [
            item,
            ...state.items.filter((i) => i.handle !== item.handle),
          ].slice(0, MAX);
          return { items: next };
        }),
      clear: () => set({ items: [] }),
    }),
    { name: "boutique-recently-viewed" },
  ),
);
