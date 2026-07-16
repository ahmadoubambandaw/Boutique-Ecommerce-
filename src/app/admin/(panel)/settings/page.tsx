import { resolveTenant } from "@/lib/tenant/registry";
import { PLANS } from "@/lib/tenant/plans";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TenantSettingsForm } from "@/components/admin/tenant-settings-form";

export default async function AdminSettingsPage() {
  const tenant = await resolveTenant();
  const plan = PLANS[tenant.plan];

  const rows: [string, string][] = [
    ["Nom de la boutique", tenant.branding.storeName],
    ["Domaine Shopify", tenant.shopify.storeDomain || "Non configuré"],
    ["Domaine personnalisé", tenant.customDomain ?? "—"],
    ["Slug", `${tenant.slug}.boutique.app`],
    ["Mode couleur", tenant.theme.defaultMode],
    ["Police", tenant.theme.fontFamily],
    ["Meta Pixel", tenant.integrations.metaPixelId ?? "Non configuré"],
    ["Google Analytics", tenant.integrations.googleAnalyticsId ?? "Non configuré"],
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Configuration de votre boutique et de votre abonnement.
        </p>
      </div>

      {/* Subscription */}
      <div className="rounded-2xl border border-[hsl(var(--border))] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Abonnement {plan.name}</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {formatPrice(plan.priceMonthly, plan.currency)}/mois · via Stripe
            </p>
          </div>
          <Badge>{tenant.status}</Badge>
        </div>
        <ul className="mt-4 grid gap-2 text-sm text-[hsl(var(--muted-foreground))] sm:grid-cols-2">
          {plan.highlights.map((h) => (
            <li key={h}>• {h}</li>
          ))}
        </ul>
        <div className="mt-5 flex gap-3">
          <a
            href="/api/stripe/portal"
            className="inline-flex h-10 items-center rounded-full bg-[hsl(var(--accent))] px-5 text-sm font-medium text-[hsl(var(--accent-foreground))]"
          >
            Gérer l'abonnement
          </a>
          <a
            href="/pricing"
            className="inline-flex h-10 items-center rounded-full border border-[hsl(var(--border))] px-5 text-sm hover:bg-[hsl(var(--muted))]"
          >
            Changer de plan
          </a>
        </div>
      </div>

      {/* Storefront customization */}
      <div className="rounded-2xl border border-[hsl(var(--border))] p-5">
        <h2 className="mb-1 font-semibold">Personnalisation de la boutique</h2>
        <p className="mb-6 text-sm text-[hsl(var(--muted-foreground))]">
          Couleurs, police, logo, bannière et SEO — appliqués instantanément à
          votre storefront.
        </p>
        <TenantSettingsForm tenant={tenant} />
      </div>

      {/* Configuration summary */}
      <div className="rounded-2xl border border-[hsl(var(--border))] p-5">
        <h2 className="mb-4 font-semibold">Récapitulatif technique</h2>
        <dl className="divide-y divide-[hsl(var(--border))]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-3 text-sm">
              <dt className="text-[hsl(var(--muted-foreground))]">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
