import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  collections,
  orders,
  products,
  type CollectionRow,
  type NewProductRow,
  type OrderRow,
  type ProductRow,
} from "@/lib/db/schema";
import type {
  NativeCollection,
  NativeProduct,
  Order,
  OrderAddress,
  OrderItem,
  OrderStatus,
  PaymentMethod,
} from "./types";

const TENANT = "default";

/* ── Row mappers ──────────────────────────────────────────── */

function rowToProduct(r: ProductRow): NativeProduct {
  return {
    id: r.id,
    handle: r.handle,
    title: r.title,
    description: r.description,
    price: Number(r.price),
    compareAtPrice: r.compareAtPrice != null ? Number(r.compareAtPrice) : null,
    currency: r.currency,
    vendor: r.vendor,
    productType: r.productType,
    tags: r.tags,
    images: r.images,
    options: r.options,
    variants: r.variants,
    available: r.available,
    featured: r.featured,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

function rowToCollection(r: CollectionRow): NativeCollection {
  return {
    id: r.id,
    handle: r.handle,
    title: r.title,
    description: r.description,
    image: r.image ?? null,
    productTypeRule: r.productTypeRule,
  };
}

function rowToOrder(r: OrderRow): Order {
  return {
    id: r.id,
    orderNumber: r.orderNumber,
    items: r.items,
    address: r.address,
    subtotal: Number(r.subtotal),
    deliveryFee: Number(r.deliveryFee),
    total: Number(r.total),
    currency: r.currency,
    paymentMethod: r.paymentMethod,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  };
}

/* ── Products ─────────────────────────────────────────────── */

export async function listNativeProducts(): Promise<NativeProduct[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.tenantId, TENANT))
    .orderBy(desc(products.createdAt));
  return rows.map(rowToProduct);
}

export async function getNativeProduct(handle: string): Promise<NativeProduct | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(products)
    .where(and(eq(products.tenantId, TENANT), eq(products.handle, handle)))
    .limit(1);
  return row ? rowToProduct(row) : null;
}

export async function upsertProduct(input: NewProductRow): Promise<NativeProduct | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .insert(products)
    .values(input)
    .onConflictDoUpdate({
      target: products.id,
      set: { ...input, updatedAt: new Date() },
    })
    .returning();
  return row ? rowToProduct(row) : null;
}

export async function deleteProduct(id: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.delete(products).where(eq(products.id, id));
}

/* ── Collections ──────────────────────────────────────────── */

export async function listNativeCollections(): Promise<NativeCollection[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(collections)
    .where(eq(collections.tenantId, TENANT))
    .orderBy(collections.position);
  return rows.map(rowToCollection);
}

export async function getNativeCollection(handle: string): Promise<NativeCollection | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(collections)
    .where(and(eq(collections.tenantId, TENANT), eq(collections.handle, handle)))
    .limit(1);
  return row ? rowToCollection(row) : null;
}

export async function listNativeCollectionsWithCounts(): Promise<
  { collection: NativeCollection; count: number }[]
> {
  const [cols, all] = await Promise.all([
    listNativeCollections(),
    listNativeProducts(),
  ]);
  return cols.map((c) => ({
    collection: c,
    count: c.productTypeRule
      ? all.filter((p) => p.productType === c.productTypeRule).length
      : all.length,
  }));
}

export async function getNativeCollectionProducts(
  handle: string,
): Promise<NativeProduct[]> {
  const collection = await getNativeCollection(handle);
  if (!collection) return [];
  const all = await listNativeProducts();
  if (!collection.productTypeRule) return all;
  return all.filter((p) => p.productType === collection.productTypeRule);
}

export async function upsertCollection(input: {
  id: string;
  handle: string;
  title: string;
  description?: string;
  productTypeRule?: string | null;
  image?: NativeCollection["image"];
  position?: number;
}): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .insert(collections)
    .values({
      id: input.id,
      tenantId: TENANT,
      handle: input.handle,
      title: input.title,
      description: input.description ?? "",
      productTypeRule: input.productTypeRule ?? null,
      image: input.image ?? null,
      position: input.position ?? 0,
    })
    .onConflictDoUpdate({
      target: collections.id,
      set: {
        title: input.title,
        description: input.description ?? "",
        productTypeRule: input.productTypeRule ?? null,
        image: input.image ?? null,
      },
    });
}

export async function deleteCollection(id: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.delete(collections).where(eq(collections.id, id));
}

/* ── Orders ───────────────────────────────────────────────── */

export async function createOrder(input: {
  id: string;
  items: OrderItem[];
  address: OrderAddress;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  paymentMethod: PaymentMethod;
}): Promise<Order | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .insert(orders)
    .values({
      id: input.id,
      tenantId: TENANT,
      items: input.items,
      address: input.address,
      subtotal: input.subtotal.toFixed(2),
      deliveryFee: input.deliveryFee.toFixed(2),
      total: input.total.toFixed(2),
      currency: input.currency,
      paymentMethod: input.paymentMethod,
      status: "pending",
    })
    .returning();
  return row ? rowToOrder(row) : null;
}

export async function listOrders(): Promise<Order[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.tenantId, TENANT))
    .orderBy(desc(orders.createdAt));
  return rows.map(rowToOrder);
}

export async function countPendingOrders(): Promise<number> {
  const db = getDb();
  if (!db) return 0;
  const rows = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.tenantId, TENANT), eq(orders.status, "pending")));
  return rows.length;
}

export async function getOrder(id: string): Promise<Order | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return row ? rowToOrder(row) : null;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.update(orders).set({ status }).where(eq(orders.id, id));
}
