import "server-only";
import * as shopify from "@/lib/shopify";
import { resolveTenant } from "@/lib/tenant/registry";
import {
  MOCK_COLLECTIONS,
  MOCK_PRODUCTS,
  mockSearch,
} from "@/lib/mock/data";
import {
  getNativeCollection,
  getNativeCollectionProducts,
  getNativeProduct,
  listNativeCollections,
  listNativeCollectionsWithCounts,
  listNativeProducts,
} from "@/lib/commerce/repository";
import { nativeToCollection, nativeToProduct } from "@/lib/commerce/map";
import type { Collection, Product } from "@/lib/shopify/types";

/**
 * App-facing catalogue facade. Source priority:
 *   1. Native DB (our own products in Supabase — no Shopify, no fees)
 *   2. Shopify Storefront API (if credentials are set and DB is empty)
 *   3. Demo/mock data (so the storefront never renders broken)
 */

async function hasShopify(): Promise<boolean> {
  const t = await resolveTenant();
  return Boolean(t.shopify.storeDomain && t.shopify.storefrontAccessToken);
}

function bySort(products: Product[], sort?: string): Product[] {
  const list = [...products];
  switch (sort) {
    case "price-asc":
      return list.sort(
        (a, b) =>
          parseFloat(a.priceRange.minVariantPrice.amount) -
          parseFloat(b.priceRange.minVariantPrice.amount),
      );
    case "price-desc":
      return list.sort(
        (a, b) =>
          parseFloat(b.priceRange.minVariantPrice.amount) -
          parseFloat(a.priceRange.minVariantPrice.amount),
      );
    case "popular":
      return list.sort((a, b) =>
        a.tags.includes("populaire") === b.tags.includes("populaire")
          ? 0
          : a.tags.includes("populaire")
            ? -1
            : 1,
      );
    default:
      return list;
  }
}

export async function listProducts(opts?: {
  sort?: string;
  query?: string;
  first?: number;
}): Promise<Product[]> {
  // 1. Native DB
  const native = await listNativeProducts().catch(() => []);
  if (native.length > 0) {
    let list = native.map(nativeToProduct);
    if (opts?.query) {
      const q = opts.query.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.vendor.toLowerCase().includes(q) ||
          p.productType.toLowerCase().includes(q),
      );
    }
    list = bySort(list, opts?.sort);
    return opts?.first ? list.slice(0, opts.first) : list;
  }

  // 2. Shopify
  if (await hasShopify()) {
    try {
      const { products } = await shopify.getProducts({
        sort: opts?.sort,
        query: opts?.query,
        first: opts?.first,
      });
      if (products.length) return products;
    } catch {
      /* fall through */
    }
  }

  // 3. Demo
  let list = opts?.query ? mockSearch(opts.query) : MOCK_PRODUCTS;
  list = bySort(list, opts?.sort);
  return opts?.first ? list.slice(0, opts.first) : list;
}

export async function getProduct(handle: string): Promise<Product | null> {
  const native = await getNativeProduct(handle).catch(() => null);
  if (native) return nativeToProduct(native);

  if (await hasShopify()) {
    try {
      const product = await shopify.getProduct(handle);
      if (product) return product;
    } catch {
      /* fall through */
    }
  }
  return MOCK_PRODUCTS.find((p) => p.handle === handle) ?? null;
}

export async function getRecommendations(
  productId: string,
  handle: string,
): Promise<Product[]> {
  const native = await listNativeProducts().catch(() => []);
  if (native.length > 0) {
    return native
      .filter((p) => p.handle !== handle)
      .slice(0, 4)
      .map(nativeToProduct);
  }
  if (await hasShopify()) {
    try {
      const recs = await shopify.getProductRecommendations(productId);
      if (recs.length) return recs.slice(0, 4);
    } catch {
      /* fall through */
    }
  }
  return MOCK_PRODUCTS.filter((p) => p.handle !== handle).slice(0, 4);
}

export async function listCollections(): Promise<Collection[]> {
  const native = await listNativeCollections().catch(() => []);
  if (native.length > 0) return native.map(nativeToCollection);

  if (await hasShopify()) {
    try {
      const collections = await shopify.getCollections();
      if (collections.length) return collections;
    } catch {
      /* fall through */
    }
  }
  return MOCK_COLLECTIONS;
}

export async function listCollectionsWithCounts(): Promise<
  { collection: Collection; count: number }[]
> {
  const native = await listNativeCollectionsWithCounts().catch(() => []);
  if (native.length > 0) {
    return native.map(({ collection, count }) => ({
      collection: nativeToCollection(collection),
      count,
    }));
  }
  const collections = await listCollections();
  return collections.map((collection) => ({ collection, count: 0 }));
}

export async function getCollection(handle: string): Promise<Collection | null> {
  const native = await getNativeCollection(handle).catch(() => null);
  if (native) return nativeToCollection(native);

  if (await hasShopify()) {
    try {
      const collection = await shopify.getCollection(handle);
      if (collection) return collection;
    } catch {
      /* fall through */
    }
  }
  return MOCK_COLLECTIONS.find((c) => c.handle === handle) ?? null;
}

export async function getCollectionProducts(
  handle: string,
  sort?: string,
): Promise<Product[]> {
  const nativeCol = await getNativeCollection(handle).catch(() => null);
  if (nativeCol) {
    const items = await getNativeCollectionProducts(handle);
    return bySort(items.map(nativeToProduct), sort);
  }

  if (await hasShopify()) {
    try {
      const { products } = await shopify.getCollectionProducts({ handle, sort });
      if (products.length) return products;
    } catch {
      /* fall through */
    }
  }
  return bySort(MOCK_PRODUCTS, sort);
}

export async function search(query: string, sort?: string): Promise<Product[]> {
  return listProducts({ query, sort });
}
