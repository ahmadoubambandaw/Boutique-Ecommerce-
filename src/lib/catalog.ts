import "server-only";
import * as shopify from "@/lib/shopify";
import { resolveTenant } from "@/lib/tenant/registry";
import {
  MOCK_COLLECTIONS,
  MOCK_PRODUCTS,
  mockSearch,
} from "@/lib/mock/data";
import type { Collection, Product } from "@/lib/shopify/types";

/**
 * App-facing catalogue facade.
 *
 * Pages call these instead of the raw Shopify service. When live Shopify
 * credentials are present we always hit Shopify (single source of truth); when
 * they're absent — or a request fails — we degrade gracefully to the demo
 * catalogue so the storefront never renders broken. This keeps the mock data
 * fully isolated from the production data path.
 */

async function hasCreds(): Promise<boolean> {
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
  if (await hasCreds()) {
    try {
      const { products } = await shopify.getProducts({
        sort: opts?.sort,
        query: opts?.query,
        first: opts?.first,
      });
      if (products.length) return products;
    } catch {
      /* fall through to demo data */
    }
  }
  let list = opts?.query ? mockSearch(opts.query) : MOCK_PRODUCTS;
  list = bySort(list, opts?.sort);
  return opts?.first ? list.slice(0, opts.first) : list;
}

export async function getProduct(handle: string): Promise<Product | null> {
  if (await hasCreds()) {
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
  if (await hasCreds()) {
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
  if (await hasCreds()) {
    try {
      const collections = await shopify.getCollections();
      if (collections.length) return collections;
    } catch {
      /* fall through */
    }
  }
  return MOCK_COLLECTIONS;
}

export async function getCollection(handle: string): Promise<Collection | null> {
  if (await hasCreds()) {
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
  if (await hasCreds()) {
    try {
      const { products } = await shopify.getCollectionProducts({ handle, sort });
      if (products.length) return products;
    } catch {
      /* fall through */
    }
  }
  // Demo: everything belongs to the collection, just sorted.
  return bySort(MOCK_PRODUCTS, sort);
}

export async function search(query: string, sort?: string): Promise<Product[]> {
  return listProducts({ query, sort });
}
