"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";
import {
  updateTenantSettingsAction,
  type SettingsState,
} from "@/lib/tenant/settings-actions";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Tenant } from "@/lib/tenant/types";

const ACCENT_PRESETS: { label: string; value: string }[] = [
  { label: "Noir", value: "240 6% 10%" },
  { label: "Indigo", value: "243 75% 59%" },
  { label: "Émeraude", value: "160 84% 39%" },
  { label: "Rose", value: "347 77% 50%" },
  { label: "Ambre", value: "38 92% 50%" },
  { label: "Bleu", value: "221 83% 53%" },
];

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[hsl(var(--muted-foreground))]">{hint}</span>}
    </label>
  );
}

function Select({
  name,
  defaultValue,
  options,
}: {
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className="h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Enregistrement…" : "Enregistrer les modifications"}
    </Button>
  );
}

export function TenantSettingsForm({ tenant }: { tenant: Tenant }) {
  const [state, formAction] = useActionState<SettingsState, FormData>(
    updateTenantSettingsAction,
    {},
  );
  const [accent, setAccent] = React.useState(tenant.theme.accent);
  const banner = tenant.banners[0];

  return (
    <form action={formAction} className="space-y-8">
      {/* Live accent preview */}
      <div className="flex items-center gap-4 rounded-2xl border border-[hsl(var(--border))] p-4">
        <div
          className="h-12 w-12 shrink-0 rounded-xl"
          style={{ backgroundColor: `hsl(${accent})` }}
        />
        <div className="flex-1">
          <p className="text-sm font-medium">Aperçu de la couleur d'accent</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ACCENT_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setAccent(p.value)}
                className="h-7 w-7 rounded-full border border-[hsl(var(--border))]"
                style={{ backgroundColor: `hsl(${p.value})` }}
                aria-label={p.label}
                title={p.label}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Branding */}
      <section className="space-y-4">
        <h3 className="font-semibold">Identité</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom de la boutique">
            <Input name="storeName" defaultValue={tenant.branding.storeName} required />
          </Field>
          <Field label="Slogan">
            <Input name="tagline" defaultValue={tenant.branding.tagline ?? ""} />
          </Field>
          <Field label="Logo (URL)">
            <Input name="logoUrl" type="url" defaultValue={tenant.branding.logoUrl ?? ""} placeholder="https://…" />
          </Field>
          <Field label="Favicon (URL)">
            <Input name="faviconUrl" type="url" defaultValue={tenant.branding.faviconUrl ?? ""} placeholder="https://…" />
          </Field>
        </div>
      </section>

      {/* Theme */}
      <section className="space-y-4">
        <h3 className="font-semibold">Thème</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Couleur d'accent (HSL)" hint="Ex : 243 75% 59%">
            <Input name="accent" value={accent} onChange={(e) => setAccent(e.target.value)} required />
          </Field>
          <Field label="Couleur primaire (HSL)">
            <Input name="primary" defaultValue={tenant.theme.primary} required />
          </Field>
          <Field label="Arrondis">
            <Select
              name="radius"
              defaultValue={tenant.theme.radius}
              options={[
                { value: "sharp", label: "Net" },
                { value: "soft", label: "Doux" },
                { value: "round", label: "Arrondi" },
              ]}
            />
          </Field>
          <Field label="Police">
            <Select
              name="fontFamily"
              defaultValue={tenant.theme.fontFamily}
              options={[
                { value: "geist", label: "Geist" },
                { value: "inter", label: "Inter" },
                { value: "playfair", label: "Playfair" },
                { value: "satoshi", label: "Satoshi" },
              ]}
            />
          </Field>
          <Field label="Mode par défaut">
            <Select
              name="defaultMode"
              defaultValue={tenant.theme.defaultMode}
              options={[
                { value: "system", label: "Système" },
                { value: "light", label: "Clair" },
                { value: "dark", label: "Sombre" },
              ]}
            />
          </Field>
        </div>
      </section>

      {/* Banner */}
      <section className="space-y-4">
        <h3 className="font-semibold">Bannière d'annonce</h3>
        <Field label="Message">
          <Input name="bannerMessage" defaultValue={banner?.message ?? ""} placeholder="Livraison offerte dès 50€…" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Lien (optionnel)">
            <Input name="bannerHref" defaultValue={banner?.href ?? ""} placeholder="/products" />
          </Field>
          <label className="flex items-center gap-2 self-end pb-3 text-sm">
            <input
              name="bannerActive"
              type="checkbox"
              defaultChecked={banner?.active ?? false}
              className="h-4 w-4 accent-[hsl(var(--accent))]"
            />
            Afficher la bannière
          </label>
        </div>
      </section>

      {/* SEO & analytics */}
      <section className="space-y-4">
        <h3 className="font-semibold">SEO & intégrations</h3>
        <Field label="Titre SEO">
          <Input name="metaTitle" defaultValue={tenant.seo.metaTitle ?? ""} />
        </Field>
        <Field label="Description SEO">
          <Textarea name="metaDescription" defaultValue={tenant.seo.metaDescription ?? ""} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Meta Pixel ID">
            <Input name="metaPixelId" defaultValue={tenant.integrations.metaPixelId ?? ""} placeholder="1234567890" />
          </Field>
          <Field label="Google Analytics ID">
            <Input name="googleAnalyticsId" defaultValue={tenant.integrations.googleAnalyticsId ?? ""} placeholder="G-XXXXXXX" />
          </Field>
        </div>
      </section>

      {state.error && (
        <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="flex items-center gap-2 rounded-xl bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-500">
          <Check className="h-4 w-4" /> Personnalisation enregistrée.
        </p>
      )}

      <SaveButton />
    </form>
  );
}
