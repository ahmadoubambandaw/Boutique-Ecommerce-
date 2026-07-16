import type {
  Cart,
  Collection,
  Connection,
  Product,
  ProductVariant,
  ShopifyImage,
} from "./types";

/** Flatten a GraphQL `edges { node }` connection into an array of nodes. */
export function flatten<T>(connection?: Connection<T> | { edges: { node: T }[] } | null): T[] {
  if (!connection?.edges) return [];
  return connection.edges.map((e) => e.node);
}

type RawProduct = Omit<Product, "images" | "variants"> & {
  images: Connection<ShopifyImage>;
  variants: Connection<ProductVariant>;
};

export function normalizeProduct(raw: RawProduct | null | undefined): Product | null {
  if (!raw) return null;
  return {
    ...raw,
    images: flatten(raw.images),
    variants: flatten(raw.variants),
  };
}

export function normalizeProducts(raw: RawProduct[]): Product[] {
  return raw.map((p) => normalizeProduct(p)).filter((p): p is Product => p !== null);
}

export function normalizeCollection(raw: Collection | null | undefined): Collection | null {
  return raw ?? null;
}

type RawCart = Omit<Cart, "lines"> & {
  lines: { edges: { node: Cart["lines"][number] }[] };
};

export function normalizeCart(raw: RawCart | null | undefined): Cart | null {
  if (!raw) return null;
  return {
    ...raw,
    lines: flatten(raw.lines),
  };
}
