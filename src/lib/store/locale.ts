"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dictionary, type Locale, type TranslationKey } from "@/lib/i18n/dictionary";

type LocaleState = {
  locale: Locale;
  setLocale: (l: Locale) => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "fr",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "boutique-locale" },
  ),
);

/** Translation hook — returns the current locale + a `t(key)` function. */
export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  const t = (key: TranslationKey): string => dictionary[locale][key] ?? key;
  return { t, locale };
}
