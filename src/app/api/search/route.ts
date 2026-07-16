import { NextResponse } from "next/server";
import { predictiveSearch } from "@/lib/shopify";
import { resolveTenant } from "@/lib/tenant/registry";
import { mockSearch } from "@/lib/mock/data";

/** Predictive search endpoint — hits Shopify, degrades to demo catalogue. */
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query) {
    return NextResponse.json({ products: [], collections: [], queries: [] });
  }

  const tenant = await resolveTenant();
  const hasCreds = Boolean(
    tenant.shopify.storeDomain && tenant.shopify.storefrontAccessToken,
  );

  if (hasCreds) {
    try {
      const result = await predictiveSearch(query);
      return NextResponse.json(result);
    } catch {
      /* fall through to demo */
    }
  }

  const products = mockSearch(query).slice(0, 6).map((p) => ({
    id: p.id,
    handle: p.handle,
    title: p.title,
    featuredImage: p.featuredImage
      ? { url: p.featuredImage.url, altText: p.featuredImage.altText }
      : null,
    priceRange: { minVariantPrice: p.priceRange.minVariantPrice },
  }));

  return NextResponse.json({ products, collections: [], queries: [] });
}
