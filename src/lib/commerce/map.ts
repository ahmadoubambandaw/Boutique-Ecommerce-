import type {
  Product,
  ProductVariant,
  Collection,
  ShopifyImage,
} from "@/lib/shopify/types";
import type { NativeProduct, NativeCollection } from "./types";

/**
 * Map our native DB models to the Shopify-shaped types the storefront already
 * consumes. This lets us swap the backend (Shopify → our DB) without touching
 * a single storefront component.
 */

function money(amount: number, currencyCode: string) {
  return { amount: amount.toFixed(2), currencyCode };
}

function toImage(url: string, alt: string | null): ShopifyImage {
  return { url, altText: alt, width: 1200, height: 1500 };
}

export function nativeToProduct(p: NativeProduct): Product {
  const images = p.images.map((i) => toImage(i.url, i.altText));
  const featuredImage = images[0] ?? null;

  const variants: ProductVariant[] =
    p.variants.length > 0
      ? p.variants.map((v) => ({
          id: v.id,
          title: v.title,
          availableForSale: v.available,
          quantityAvailable: null,
          selectedOptions: Object.entries(v.options).map(([name, value]) => ({
            name,
            value,
          })),
          price: money(v.price, p.currency),
          compareAtPrice: v.compareAtPrice
            ? money(v.compareAtPrice, p.currency)
            : null,
          image: featuredImage,
        }))
      : [
          {
            id: `${p.id}-default`,
            title: "Default Title",
            availableForSale: p.available,
            quantityAvailable: null,
            selectedOptions: [],
            price: money(p.price, p.currency),
            compareAtPrice: p.compareAtPrice
              ? money(p.compareAtPrice, p.currency)
              : null,
            image: featuredImage,
          },
        ];

  const prices = variants.map((v) => parseFloat(v.price.amount));
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    descriptionHtml: p.description
      .split("\n")
      .filter(Boolean)
      .map((line) => `<p>${line}</p>`)
      .join(""),
    vendor: p.vendor,
    productType: p.productType,
    tags: p.tags,
    availableForSale: p.available,
    totalInventory: null,
    featuredImage,
    images,
    options: p.options.map((o, i) => ({
      id: `${p.id}-opt-${i}`,
      name: o.name,
      values: o.values,
    })),
    variants,
    priceRange: {
      minVariantPrice: money(min, p.currency),
      maxVariantPrice: money(max, p.currency),
    },
    compareAtPriceRange: {
      minVariantPrice: money(p.compareAtPrice ?? 0, p.currency),
      maxVariantPrice: money(p.compareAtPrice ?? 0, p.currency),
    },
    seo: { title: p.title, description: null },
    updatedAt: p.updatedAt,
  };
}

export function nativeToCollection(c: NativeCollection): Collection {
  return {
    id: c.id,
    handle: c.handle,
    title: c.title,
    description: c.description,
    image: c.image ? toImage(c.image.url, c.image.altText) : null,
    seo: { title: c.title, description: null },
    updatedAt: new Date().toISOString(),
  };
}
