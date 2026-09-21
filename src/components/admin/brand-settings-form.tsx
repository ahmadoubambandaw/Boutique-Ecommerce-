"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { Check, FileText, Megaphone, Palette } from "lucide-react";
import {
  saveBrandSettingsAction,
  type BrandSettingsState,
} from "@/lib/actions/site-settings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PRESETS: { label: string; value: string }[] = [
  { label: "Marine GSE", value: "214 81% 20%" },
  { label: "Rouge sécurité", value: "358 79% 47%" },
  { label: "Bleu", value: "221 83% 53%" },
  { label: "Émeraude", value: "160 84% 39%" },
  { label: "Ambre", value: "38 92% 50%" },
  { label: "Violet", value: "262 83% 58%" },
  { label: "Noir", value: "240 6% 12%" },
];

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Enregistrement…" : "Enregistrer"}
    </Button>
  );
}

export function BrandSettingsForm({
  storeName,
  tagline,
  accent,
  bannerMessage,
  bannerActive,
  metaPixelId,
  googleAnalyticsId,
  invoicePhone,
  invoiceWhatsapp,
  invoiceEmail,
  invoiceAddress,
  bankAccountNumber,
  bankRib,
  bankCode,
}: {
  storeName: string;
  tagline: string;
  accent: string;
  bannerMessage: string;
  bannerActive: boolean;
  metaPixelId: string;
  googleAnalyticsId: string;
  invoicePhone: string;
  invoiceWhatsapp: string;
  invoiceEmail: string;
  invoiceAddress: string;
  bankAccountNumber: string;
  bankRib: string;
  bankCode: string;
}) {
  const [state, action] = useActionState<BrandSettingsState, FormData>(
    saveBrandSettingsAction,
    {},
  );
  const [color, setColor] = React.useState(accent);

  return (
    <form action={action} className="space-y-8">
      {/* Accent colour */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-[hsl(var(--accent))]" />
          <h3 className="font-semibold">Couleur d&apos;accent</h3>
        </div>

        {/* Live preview */}
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[hsl(var(--border))] p-4">
          <motion.div
            key={color}
            initial={{ scale: 0.85, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-14 w-14 shrink-0 rounded-2xl shadow-lg"
            style={{ backgroundColor: `hsl(${color})` }}
          />
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const active = p.value === color;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setColor(p.value)}
                  aria-label={p.label}
                  title={p.label}
                  className="relative h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-[hsl(var(--background))] transition-transform hover:scale-110"
                  style={{
                    backgroundColor: `hsl(${p.value})`,
                    boxShadow: active ? undefined : "none",
                  }}
                >
                  <span
                    className="absolute inset-0 rounded-full ring-2 transition-opacity"
                    style={{
                      boxShadow: active
                        ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(${p.value})`
                        : "none",
                    }}
                  />
                  {active && (
                    <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="w-full sm:w-auto sm:flex-1">
            <label className="mb-1 block text-xs text-[hsl(var(--muted-foreground))]">
              Valeur HSL personnalisée (ex : 214 81% 20%)
            </label>
            <Input
              name="accent"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Cette couleur pilote les boutons, liens et éléments actifs de toute la
          boutique. Le changement s&apos;applique immédiatement après
          enregistrement.
        </p>
      </section>

      {/* Identity */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Nom de la boutique
          </label>
          <Input name="storeName" defaultValue={storeName} placeholder="GSE" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Slogan</label>
          <Input
            name="tagline"
            defaultValue={tagline}
            placeholder="Votre sécurité, notre engagement."
          />
        </div>
      </section>

      {/* Banner */}
      <section className="space-y-3">
        <h3 className="font-semibold">Bannière d&apos;annonce</h3>
        <Input
          name="bannerMessage"
          defaultValue={bannerMessage}
          placeholder="EPI & sécurité incendie — Livraison à Dakar…"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="bannerActive"
            defaultChecked={bannerActive}
            className="h-4 w-4 accent-[hsl(var(--accent))]"
          />
          Afficher la bannière en haut du site
        </label>
      </section>

      {/* Ad tracking */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-[hsl(var(--accent))]" />
          <h3 className="font-semibold">Suivi & publicité</h3>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Renseignez ces identifiants pour suivre les ventes venant de vos
          campagnes Facebook/Instagram et Google.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Meta Pixel ID
            </label>
            <Input
              name="metaPixelId"
              defaultValue={metaPixelId}
              placeholder="Ex. 1234567890123456"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Google Analytics ID
            </label>
            <Input
              name="googleAnalyticsId"
              defaultValue={googleAnalyticsId}
              placeholder="Ex. G-XXXXXXXXXX"
            />
          </div>
        </div>
      </section>

      {/* Invoice / proforma */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[hsl(var(--accent))]" />
          <h3 className="font-semibold">Facture proforma</h3>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Coordonnées affichées sur les devis et factures proforma téléchargés
          par vos clients. Laissez vide pour masquer une ligne.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Téléphone</label>
            <Input
              name="invoicePhone"
              defaultValue={invoicePhone}
              placeholder="705442602"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">WhatsApp</label>
            <Input
              name="invoiceWhatsapp"
              defaultValue={invoiceWhatsapp}
              placeholder="221 76 262 63 14"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">E-mail</label>
            <Input
              name="invoiceEmail"
              defaultValue={invoiceEmail}
              placeholder="commerciale.gse@gmail.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Adresse</label>
            <Input
              name="invoiceAddress"
              defaultValue={invoiceAddress}
              placeholder="Zac Mbao"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              N° de compte bancaire
            </label>
            <Input
              name="bankAccountNumber"
              defaultValue={bankAccountNumber}
              placeholder="001178584001"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Clé RIB</label>
            <Input name="bankRib" defaultValue={bankRib} placeholder="87" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Code banque</label>
            <Input name="bankCode" defaultValue={bankCode} placeholder="SNO48" />
          </div>
        </div>
      </section>

      {state.error && (
        <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {state.error}
        </p>
      )}
      {state.ok && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600"
        >
          <Check className="h-4 w-4" /> Enregistré. Rafraîchissez la boutique
          pour voir le changement.
        </motion.p>
      )}

      <SaveButton />
    </form>
  );
}
