/**
 * Domain types for the Shopify Storefront API.
 * These mirror the GraphQL responses but are flattened for ergonomic use
 * across the app. Shopify remains the single source of truth — we never
 * persist these locally, we only shape them in memory per request.
 */

export type Money = {
  amount: string;
  currencyCode: string;
};

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type SelectedOption = {
  name: string;
  value: string;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  selectedOptions: SelectedOption[];
  price: Money;
  compareAtPrice: Money | null;
  image: ShopifyImage | null;
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  totalInventory: number | null;
  featuredImage: ShopifyImage | null;
  images: ShopifyImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  compareAtPriceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  seo: { title: string | null; description: string | null };
  updatedAt: string;
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  seo: { title: string | null; description: string | null };
  updatedAt: string;
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: Money };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: SelectedOption[];
    product: {
      handle: string;
      title: string;
      featuredImage: ShopifyImage | null;
    };
    price: Money;
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money | null;
    totalDutyAmount: Money | null;
  };
  lines: CartLine[];
};

export type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

export type Connection<T> = {
  edges: { node: T; cursor: string }[];
  pageInfo: PageInfo;
};

export type ProductSortKey =
  | "RELEVANCE"
  | "BEST_SELLING"
  | "CREATED_AT"
  | "PRICE"
  | "TITLE";

export type ProductFilter = {
  available?: boolean;
  price?: { min?: number; max?: number };
  productType?: string;
  vendor?: string;
  variantOption?: { name: string; value: string };
};
