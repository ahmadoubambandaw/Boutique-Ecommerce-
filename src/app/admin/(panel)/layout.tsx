import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { getAdminSession, adminLogoutAction } from "@/lib/auth/admin-actions";
import { isDbConfigured } from "@/lib/db/client";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const NAV = [
  { label: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard, superOnly: false },
  { label: "Produits", href: "/admin/products", icon: Package, superOnly: false },
  { label: "Commandes", href: "/admin/orders", icon: ShoppingCart, superOnly: false },
  { label: "Super Admin", href: "/admin/super", icon: Building2, superOnly: true },
  { label: "Paramètres", href: "/admin/settings", icon: Settings, superOnly: false },
];

/** Admin shell — deliberately separate from the storefront chrome. */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  // In demo mode (no DB) treat the viewer as super admin so the full showcase
  // is browsable; in production the middleware + session enforce real roles.
  const isSuper = session ? session.role === "super_admin" : !isDbConfigured();
  const nav = NAV.filter((item) => !item.superOnly || isSuper);

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[hsl(var(--border))] p-4 lg:flex">
        <Link href="/admin" className="mb-8 px-3 py-2 text-lg font-semibold">
          Boutique<span className="text-[hsl(var(--muted-foreground))]">.admin</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        {session && (
          <form action={adminLogoutAction}>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]">
              <LogOut className="h-4 w-4" /> Déconnexion
            </button>
          </form>
        )}
        <Link
          href="/"
          className="rounded-xl px-3 py-2.5 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
        >
          ← Retour à la boutique
        </Link>
      </aside>

      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] px-6">
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            {session
              ? `Connecté · ${session.email}`
              : "Mode démo · données de démonstration"}
          </span>
          <ThemeToggle />
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
