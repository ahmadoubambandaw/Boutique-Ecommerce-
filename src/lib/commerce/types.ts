/**
 * Native commerce types — the app's OWN catalogue model, stored in Postgres
 * (Supabase). This replaces Shopify: products, collections and orders all live
 * in our database, so the store runs with zero third-party subscription.
 *
 * The storefront still consumes the Shopify-shaped `Product` type (see
 * `lib/shopify/types`); a mapper in `lib/commerce/map.ts` converts native rows
 * to that shape so no storefront component changes.
 */

export type NativeImage = { url: string; altText: string | null };

export type NativeOption = { name: string; values: string[] };

export type NativeVariant = {
  id: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  options: Record<string, string>;
  available: boolean;
};

export type NativeProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  vendor: string;
  productType: string;
  tags: string[];
  images: NativeImage[];
  options: NativeOption[];
  variants: NativeVariant[];
  available: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NativeCollection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: NativeImage | null;
  /** When set, the collection auto-includes products of this productType. */
  productTypeRule: string | null;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "mobile_money";

export type OrderItem = {
  productId: string;
  handle: string;
  title: string;
  variantTitle: string;
  price: number;
  quantity: number;
  image: string | null;
};

export type OrderAddress = {
  fullName: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  region: string;
  country: string;
  note: string | null;
};

export type Order = {
  id: string;
  orderNumber: number;
  items: OrderItem[];
  address: OrderAddress;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
};
