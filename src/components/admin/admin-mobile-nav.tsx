"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  UserCog,
  X,
} from "lucide-react";
import { adminLogoutAction } from "@/lib/auth/admin-actions";

const NAV = [
  { label: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard, superOnly: false },
  { label: "Produits", href: "/admin/products", icon: Package, superOnly: false },
  { label: "Commandes", href: "/admin/orders", icon: ShoppingCart, superOnly: false },
  { label: "Super Admin", href: "/admin/super", icon: Building2, superOnly: true },
  { label: "Mon compte", href: "/admin/account", icon: UserCog, superOnly: false },
  { label: "Paramètres", href: "/admin/settings", icon: Settings, superOnly: false },
];

export function AdminMobileNav({
  isSuper,
  hasSession,
}: {
  isSuper: boolean;
  hasSession: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const nav = NAV.filter((item) => !item.superOnly || isSuper);

  // Lock body scroll while the drawer is open.
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[90]">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
            <div className="mb-6 flex items-center justify-between">
              <span className="px-2 text-lg font-semibold">
                Boutique
                <span className="text-[hsl(var(--muted-foreground))]">.admin</span>
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
              {nav.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                      active
                        ? "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
                        : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {hasSession && (
              <form action={adminLogoutAction} className="mt-2">
                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]">
                  <LogOut className="h-4 w-4" /> Déconnexion
                </button>
              </form>
            )}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
            >
              ← Retour à la boutique
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
