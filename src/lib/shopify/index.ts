import "server-only";
import { shopifyFetch } from "./client";
import {
  addToCartMutation,
  applyDiscountMutation,
  createCartMutation,
  getCartQuery,
  getCollectionProductsQuery,
  getCollectionQuery,
  getCollectionsQuery,
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery,
  predictiveSearchQuery,
  removeFromCartMutation,
  updateCartMutation,
} from "./queries";
import {
  flatten,
  normalizeCart,
  normalizeProduct,
  normalizeProducts,
} from "./normalize";
import type {
  Cart,
  Collection,
  Connection,
  Product,
  ProductFilter,
  ProductSortKey,
} from "./types";

/* Cache tags — revalidated on-demand by Shopify webhooks. */
export const TAGS = {
  products: "products",
  collections: "collections",
  cart: "cart",
} as const;

/* ── Products ─────────────────────────────────────────────── */

export async function getProduct(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<{ product: Parameters<typeof normalizeProduct>[0] }>({
    query: getProductQuery,
    variables: { handle },
    tags: [TAGS.products],
  });
  return normalizeProduct(data.product);
}

const SORT_MAP: Record<
  string,
  { sortKey: ProductSortKey; reverse: boolean }
> = {
  latest: { sortKey: "CREATED_AT", reverse: true },
  popular: { sortKey: "BEST_SELLING", reverse: false },
  "price-asc": { sortKey: "PRICE", reverse: false },
  "price-desc": { sortKey: "PRICE", reverse: true },
  relevance: { sortKey: "RELEVANCE", reverse: false },
};

export async function getProducts(opts?: {
  first?: number;
  after?: string;
  sort?: string;
  query?: string;
}): Promise<{ products: Product[]; endCursor: string | null; hasNextPage: boolean }> {
  const sort = SORT_MAP[opts?.sort ?? "latest"] ?? SORT_MAP.latest!;
  const data = await shopifyFetch<{
    products: Connection<Parameters<typeof normalizeProduct>[0]>;
  }>({
    query: getProductsQuery,
    variables: {
      first: opts?.first ?? 24,
      after: opts?.after ?? null,
      sortKey: sort.sortKey,
      reverse: sort.reverse,
      query: opts?.query ?? null,
    },
    tags: [TAGS.products],
  });

  return {
    products: normalizeProducts(flatten(data.products) as never[]),
    endCursor: data.products.pageInfo.endCursor,
    hasNextPage: data.products.pageInfo.hasNextPage,
  };
}

export async function getProductRecommendations(
  productId: string,
): Promise<Product[]> {
  const data = await shopifyFetch<{
    productRecommendations: Parameters<typeof normalizeProduct>[0][];
  }>({
    query: getProductRecommendationsQuery,
    variables: { productId },
    tags: [TAGS.products],
  });
  return normalizeProducts((data.productRecommendations ?? []) as never[]);
}

/* ── Collections ──────────────────────────────────────────── */

export async function getCollections(first = 20): Promise<Collection[]> {
  const data = await shopifyFetch<{ collections: Connection<Collection> }>({
    query: getCollectionsQuery,
    variables: { first },
    tags: [TAGS.collections],
  });
  return flatten(data.collections);
}

export async function getCollection(handle: string): Promise<Collection | null> {
  const data = await shopifyFetch<{ collection: Collection | null }>({
    query: getCollectionQuery,
    variables: { handle },
    tags: [TAGS.collections],
  });
  return data.collection;
}

export async function getCollectionProducts(opts: {
  handle: string;
  first?: number;
  after?: string;
  sort?: string;
  filters?: ProductFilter[];
}): Promise<{ products: Product[]; endCursor: string | null; hasNextPage: boolean }> {
  const sort = SORT_MAP[opts.sort ?? "latest"] ?? SORT_MAP.latest!;
  const data = await shopifyFetch<{
    collection: { products: Connection<Parameters<typeof normalizeProduct>[0]> } | null;
  }>({
    query: getCollectionProductsQuery,
    variables: {
      handle: opts.handle,
      first: opts.first ?? 24,
      after: opts.after ?? null,
      // Collection sort keys differ slightly; map PRICE/CREATED where valid.
      sortKey: sort.sortKey === "RELEVANCE" ? "COLLECTION_DEFAULT" : sort.sortKey,
      reverse: sort.reverse,
      filters: opts.filters ?? null,
    },
    tags: [TAGS.products, TAGS.collections],
  });

  if (!data.collection) {
    return { products: [], endCursor: null, hasNextPage: false };
  }

  return {
    products: normalizeProducts(flatten(data.collection.products) as never[]),
    endCursor: data.collection.products.pageInfo.endCursor,
    hasNextPage: data.collection.products.pageInfo.hasNextPage,
  };
}

/* ── Search ───────────────────────────────────────────────── */

export type PredictiveResult = {
  queries: { text: string }[];
  products: {
    id: string;
    handle: string;
    title: string;
    featuredImage: { url: string; altText: string | null } | null;
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  }[];
  collections: { handle: string; title: string }[];
};

export async function predictiveSearch(query: string): Promise<PredictiveResult> {
  if (!query.trim()) return { queries: [], products: [], collections: [] };
  const data = await shopifyFetch<{ predictiveSearch: PredictiveResult }>({
    query: predictiveSearchQuery,
    variables: { query },
    revalidate: 0,
  });
  return data.predictiveSearch;
}

/* ── Cart ─────────────────────────────────────────────────── */

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{ cart: Parameters<typeof normalizeCart>[0] }>({
    query: getCartQuery,
    variables: { cartId },
    revalidate: 0,
  });
  return normalizeCart(data.cart);
}

export async function createCart(
  lines: { merchandiseId: string; quantity: number }[] = [],
): Promise<Cart | null> {
  const data = await shopifyFetch<{
    cartCreate: { cart: Parameters<typeof normalizeCart>[0]; userErrors: unknown[] };
  }>({ query: createCartMutation, variables: { lines }, revalidate: 0 });
  return normalizeCart(data.cartCreate.cart);
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
): Promise<Cart | null> {
  const data = await shopifyFetch<{
    cartLinesAdd: { cart: Parameters<typeof normalizeCart>[0] };
  }>({ query: addToCartMutation, variables: { cartId, lines }, revalidate: 0 });
  return normalizeCart(data.cartLinesAdd.cart);
}

export async function updateCart(
  cartId: string,
  lines: { id: string; merchandiseId: string; quantity: number }[],
): Promise<Cart | null> {
  const data = await shopifyFetch<{
    cartLinesUpdate: { cart: Parameters<typeof normalizeCart>[0] };
  }>({ query: updateCartMutation, variables: { cartId, lines }, revalidate: 0 });
  return normalizeCart(data.cartLinesUpdate.cart);
}

export async function removeFromCart(
  cartId: string,
  lineIds: string[],
): Promise<Cart | null> {
  const data = await shopifyFetch<{
    cartLinesRemove: { cart: Parameters<typeof normalizeCart>[0] };
  }>({ query: removeFromCartMutation, variables: { cartId, lineIds }, revalidate: 0 });
  return normalizeCart(data.cartLinesRemove.cart);
}

export async function applyDiscount(
  cartId: string,
  codes: string[],
): Promise<Cart | null> {
  const data = await shopifyFetch<{
    cartDiscountCodesUpdate: { cart: Parameters<typeof normalizeCart>[0] };
  }>({ query: applyDiscountMutation, variables: { cartId, codes }, revalidate: 0 });
  return normalizeCart(data.cartDiscountCodesUpdate.cart);
}
