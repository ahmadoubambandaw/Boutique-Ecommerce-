import type { MetadataRoute } from "next";
import { listProducts, listCollections } from "@/lib/catalog";
import { appUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = appUrl();
  const now = new Date();

  const staticRoutes = [
    "",
    "/products",
    "/collections",
    "/about",
    "/contact",
    "/faq",
    "/blog",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const [products, collections] = await Promise.all([
    listProducts({ first: 250 }),
    listCollections(),
  ]);

  const productRoutes = products.map((p) => ({
    url: `${base}/products/${p.handle}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const collectionRoutes = collections.map((c) => ({
    url: `${base}/collections/${c.handle}`,
    lastModified: new Date(c.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...collectionRoutes, ...productRoutes];
}
