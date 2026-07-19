import { Palette, Info } from "lucide-react";
import { resolveTenant } from "@/lib/tenant/registry";
import { getSiteSettings } from "@/lib/commerce/settings";
import { isDbConfigured } from "@/lib/db/client";
import { CONTACT } from "@/lib/contact";
import { BrandSettingsForm } from "@/components/admin/brand-settings-form";
import { AdminReveal } from "@/components/admin/admin-reveal";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [tenant, settings] = await Promise.all([
    resolveTenant(),
    getSiteSettings(),
  ]);

  const rows: [string, string][] = [
    ["Nom de la boutique", tenant.branding.storeName],
    ["Contact e-mail", CONTACT.email],
    ["Téléphone", CONTACT.phone],
    ["Adresse", CONTACT.address],
    ["Base de données", isDbConfigured() ? "Connectée ✓" : "Non configurée"],
    ["Mode couleur par défaut", tenant.theme.defaultMode],
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <AdminReveal>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Personnalisez l&apos;apparence de votre boutique.
          </p>
        </div>
      </AdminReveal>

      {/* Appearance */}
      <AdminReveal delay={0.05}>
        <div className="rounded-2xl border border-[hsl(var(--border))] p-5 sm:p-6">
          <div className="mb-1 flex items-center gap-2">
            <Palette className="h-5 w-5 text-[hsl(var(--accent))]" />
            <h2 className="font-semibold">Apparence de la boutique</h2>
          </div>
          <p className="mb-6 text-sm text-[hsl(var(--muted-foreground))]">
            Couleur d&apos;accent, nom, slogan et bannière — appliqués à tout le
            storefront.
          </p>
          {isDbConfigured() ? (
            <BrandSettingsForm
              storeName={settings?.storeName ?? tenant.branding.storeName}
              tagline={settings?.tagline ?? tenant.branding.tagline ?? ""}
              accent={settings?.accent ?? tenant.theme.accent}
              bannerMessage={
                settings?.bannerMessage ?? tenant.banners[0]?.message ?? ""
              }
              bannerActive={settings?.bannerActive ?? true}
            />
          ) : (
            <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-sm">
              Connectez une base de données pour enregistrer la personnalisation.
            </p>
          )}
        </div>
      </AdminReveal>

      {/* Info recap */}
      <AdminReveal delay={0.1}>
        <div className="rounded-2xl border border-[hsl(var(--border))] p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            <h2 className="font-semibold">Informations</h2>
          </div>
          <dl className="divide-y divide-[hsl(var(--border))]">
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4 py-3 text-sm">
                <dt className="text-[hsl(var(--muted-foreground))]">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </AdminReveal>
    </div>
  );
}
