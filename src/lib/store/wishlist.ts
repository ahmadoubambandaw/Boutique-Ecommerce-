"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishlistItem = {
  handle: string;
  title: string;
  image: string | null;
  price: string;
  currencyCode: string;
};

type WishlistState = {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  remove: (handle: string) => void;
  has: (handle: string) => boolean;
  clear: () => void;
};

/** Favorites are a client-side convenience layer synced to localStorage. */
export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) =>
        set((state) =>
          state.items.some((i) => i.handle === item.handle)
            ? { items: state.items.filter((i) => i.handle !== item.handle) }
            : { items: [item, ...state.items] },
        ),
      remove: (handle) =>
        set((state) => ({
          items: state.items.filter((i) => i.handle !== handle),
        })),
      has: (handle) => get().items.some((i) => i.handle === handle),
      clear: () => set({ items: [] }),
    }),
    { name: "boutique-wishlist" },
  ),
);
