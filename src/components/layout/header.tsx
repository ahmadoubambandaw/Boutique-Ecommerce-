"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, PackageSearch, Search, ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/store/cart";
import { useWishlist } from "@/lib/store/wishlist";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchCommand } from "@/components/search/search-command";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { useT } from "@/lib/store/locale";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const NAV: { key: TranslationKey; href: string }[] = [
  { key: "nav.catalog", href: "/products" },
  { key: "nav.collections", href: "/collections" },
  { key: "nav.new", href: "/collections/nouveautes" },
  { key: "nav.blog", href: "/blog" },
  { key: "nav.about", href: "/about" },
];

export function Header({
  storeName = "GSE",
  logoUrl = null,
}: {
  storeName?: string;
  logoUrl?: string | null;
}) {
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  const { t } = useT();
  const cartCount = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const openCart = useCart((s) => s.open);
  const wishlistCount = useWishlist((s) => s.items.length);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-500",
          scrolled ? "glass-strong border-b border-[hsl(var(--border))]" : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))] lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center gap-2" aria-label={storeName}>
              {logoUrl && (
                <Image
                  src={logoUrl}
                  alt={storeName}
                  width={40}
                  height={40}
                  priority
                  className="h-10 w-10 rounded-md object-contain"
                />
              )}
              <span className="text-xl font-bold tracking-tight">
                {storeName}
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative rounded-full px-4 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5">
            <button
              aria-label="Rechercher"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
            >
              <Search className="h-5 w-5" />
            </button>
            <ThemeToggle />
            <LocaleSwitcher />
            <Link
              href="/wishlist"
              aria-label="Favoris"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Link>
            <Link
              href="/track"
              aria-label="Suivi de commande"
              className="hidden h-11 w-11 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))] sm:inline-flex"
            >
              <PackageSearch className="h-5 w-5" />
            </Link>
            <button
              aria-label="Panier"
              onClick={openCart}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
            >
              <ShoppingBag className="h-5 w-5" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[hsl(var(--accent))] px-1 text-[11px] font-semibold text-[hsl(var(--accent-foreground))]"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              className="absolute left-0 top-0 h-full w-80 max-w-[85%] glass-strong p-6"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="text-lg font-semibold">{storeName}.</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-4 py-3 text-lg font-medium hover:bg-[hsl(var(--muted))]"
                  >
                    {t(item.key)}
                  </Link>
                ))}
                <Link
                  href="/track"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-lg font-medium hover:bg-[hsl(var(--muted))]"
                >
                  Suivi de commande
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
