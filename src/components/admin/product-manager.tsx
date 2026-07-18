"use client";

import * as React from "react";
import Image from "next/image";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  saveProductAction,
  deleteProductAction,
} from "@/lib/actions/admin-commerce";
import type { NativeProduct } from "@/lib/commerce/types";

export function ProductManager({
  products,
  readOnly,
}: {
  products: NativeProduct[];
  readOnly: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<NativeProduct | null | undefined>(
    undefined,
  );
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isFormOpen = editing !== undefined;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await saveProductAction({}, fd);
    setPending(false);
    if (res.ok) {
      setEditing(undefined);
      router.refresh();
    } else {
      setError(res.error ?? "Erreur.");
    }
  }

  async function onDelete(id: string, title: string) {
    if (!confirm(`Supprimer « ${title} » ?`)) return;
    const res = await deleteProductAction(id);
    if (res.ok) router.refresh();
    else setError(res.error ?? "Suppression impossible.");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Produits</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {products.length} produit{products.length > 1 ? "s" : ""} dans votre
            catalogue.
          </p>
        </div>
        {!readOnly && !isFormOpen && (
          <Button onClick={() => setEditing(null)}>
            <Plus className="h-4 w-4" /> Ajouter un produit
          </Button>
        )}
      </div>

      {readOnly && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          Mode démo : connectez une base de données pour créer et modifier vos
          produits.
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      )}

      {isFormOpen && (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-[hsl(var(--border))] p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {editing ? "Modifier le produit" : "Nouveau produit"}
            </h2>
            <button
              type="button"
              onClick={() => setEditing(undefined)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {editing && <input type="hidden" name="id" defaultValue={editing.id} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">Titre</label>
              <Input
                name="title"
                required
                defaultValue={editing?.title}
                placeholder="Ex. Casque de chantier"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Prix (FCFA)
              </label>
              <Input
                name="price"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={editing?.price}
                placeholder="5000"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Prix barré (optionnel)
              </label>
              <Input
                name="compareAtPrice"
                type="number"
                min="0"
                step="1"
                defaultValue={editing?.compareAtPrice ?? ""}
                placeholder="7000"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Marque</label>
              <Input
                name="vendor"
                defaultValue={editing?.vendor}
                placeholder="Marque"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Catégorie
              </label>
              <Input
                name="productType"
                defaultValue={editing?.productType}
                placeholder="Ex. Protection tête"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">
                Description
              </label>
              <Textarea
                name="description"
                defaultValue={editing?.description}
                className="min-h-24"
                placeholder="Description du produit…"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">
                Images (une URL par ligne)
              </label>
              <Textarea
                name="images"
                defaultValue={editing?.images.map((i) => i.url).join("\n")}
                className="min-h-20 font-mono text-xs"
                placeholder="https://…/photo1.jpg"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">
                Tags (séparés par des virgules)
              </label>
              <Input
                name="tags"
                defaultValue={editing?.tags.join(", ")}
                placeholder="populaire, nouveau"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="available"
                defaultChecked={editing ? editing.available : true}
                className="h-4 w-4"
              />
              En stock
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={editing?.featured ?? false}
                className="h-4 w-4"
              />
              Mis en avant
            </label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Enregistrement…" : "Enregistrer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(undefined)}
            >
              Annuler
            </Button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="overflow-x-auto rounded-2xl border border-[hsl(var(--border))]">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--border))] text-left text-[hsl(var(--muted-foreground))]">
              <th className="p-4 font-medium">Produit</th>
              <th className="p-4 font-medium">Catégorie</th>
              <th className="p-4 font-medium">Statut</th>
              <th className="p-4 text-right font-medium">Prix</th>
              {!readOnly && <th className="p-4 text-right font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={readOnly ? 4 : 5}
                  className="p-8 text-center text-[hsl(var(--muted-foreground))]"
                >
                  Aucun produit pour le moment.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-[hsl(var(--border))] last:border-0"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[hsl(var(--muted))]">
                        {p.images[0] && (
                          <Image
                            src={p.images[0].url}
                            alt={p.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <span className="font-medium">{p.title}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[hsl(var(--muted-foreground))]">
                    {p.productType || "—"}
                  </td>
                  <td className="p-4">
                    <Badge variant={p.available ? "default" : "muted"}>
                      {p.available ? "En stock" : "Épuisé"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right tabular-nums">
                    {formatPrice(p.price, p.currency)}
                  </td>
                  {!readOnly && (
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setError(null);
                            setEditing(p);
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))]"
                          aria-label="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(p.id, p.title)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[hsl(var(--muted-foreground))] hover:bg-red-500/10 hover:text-red-500"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
