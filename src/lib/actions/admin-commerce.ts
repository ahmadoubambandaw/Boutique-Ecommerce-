"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/admin-actions";
import { isDbConfigured } from "@/lib/db/client";
import {
  deleteProduct,
  updateOrderStatus,
  upsertProduct,
} from "@/lib/commerce/repository";
import { captureError } from "@/lib/monitoring";
import type { NativeImage } from "@/lib/commerce/types";
import type { OrderStatus } from "@/lib/commerce/types";

export type AdminActionState = { ok?: boolean; error?: string };

/** Guard: writes require an authenticated admin whenever a DB is configured. */
async function requireAdmin(): Promise<AdminActionState | null> {
  if (!isDbConfigured()) {
    return {
      error:
        "Mode démo : configurez une base de données pour gérer le catalogue.",
    };
  }
  const session = await getAdminSession();
  if (!session) return { error: "Session expirée. Reconnectez-vous." };
  return null;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const productSchema = z.object({
  id: z.string().optional(),
  handle: z.string().optional(),
  title: z.string().min(1, "Titre requis"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Prix invalide"),
  compareAtPrice: z.coerce.number().min(0).optional(),
  vendor: z.string().optional(),
  productType: z.string().optional(),
  tags: z.string().optional(),
  images: z.string().optional(),
  available: z.boolean().optional(),
  featured: z.boolean().optional(),
});

/** Create or update a product from the admin form. */
export async function saveProductAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const guard = await requireAdmin();
  if (guard) return guard;

  const parsed = productSchema.safeParse({
    id: formData.get("id") || undefined,
    handle: formData.get("handle") || undefined,
    title: formData.get("title"),
    description: formData.get("description") || "",
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || undefined,
    vendor: formData.get("vendor") || "",
    productType: formData.get("productType") || "",
    tags: formData.get("tags") || "",
    images: formData.get("images") || "",
    available: formData.get("available") === "on",
    featured: formData.get("featured") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }
  const d = parsed.data;

  const handle = d.handle?.trim() ? slugify(d.handle) : slugify(d.title);
  const id = d.id?.trim() || crypto.randomUUID();

  const images: NativeImage[] = (d.images ?? "")
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((url) => ({ url, altText: d.title }));

  const tags = (d.tags ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    const saved = await upsertProduct({
      id,
      tenantId: "default",
      handle,
      title: d.title,
      description: d.description ?? "",
      price: d.price.toFixed(2),
      compareAtPrice:
        d.compareAtPrice && d.compareAtPrice > 0
          ? d.compareAtPrice.toFixed(2)
          : null,
      currency: "XOF",
      vendor: d.vendor ?? "",
      productType: d.productType ?? "",
      tags,
      images,
      options: [],
      variants: [],
      available: d.available ?? true,
      featured: d.featured ?? false,
    });

    if (!saved) return { error: "Enregistrement impossible." };

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${handle}`);
    return { ok: true };
  } catch (err) {
    captureError(err, { stage: "save-product" });
    return { error: "Une erreur est survenue. Réessayez." };
  }
}

/** Delete a product. */
export async function deleteProductAction(
  id: string,
): Promise<AdminActionState> {
  const guard = await requireAdmin();
  if (guard) return guard;
  try {
    await deleteProduct(id);
    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { ok: true };
  } catch (err) {
    captureError(err, { stage: "delete-product" });
    return { error: "Suppression impossible." };
  }
}

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

/** Update an order's fulfilment status. */
export async function setOrderStatusAction(
  id: string,
  status: string,
): Promise<AdminActionState> {
  const guard = await requireAdmin();
  if (guard) return guard;
  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    return { error: "Statut invalide." };
  }
  try {
    await updateOrderStatus(id, status as OrderStatus);
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (err) {
    captureError(err, { stage: "set-order-status" });
    return { error: "Mise à jour impossible." };
  }
}
