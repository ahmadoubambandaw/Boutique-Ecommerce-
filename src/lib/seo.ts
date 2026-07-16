import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/registry";

export function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/** Build the base per-tenant Metadata (title template, OG, Twitter, icons). */
export async function buildBaseMetadata(): Promise<Metadata> {
  const tenant = await resolveTenant();
  const title = tenant.seo.metaTitle ?? tenant.branding.storeName;
  const description =
    tenant.seo.metaDescription ??
    "Une expérience d'achat headless premium, plus rapide et élégante.";

  return {
    metadataBase: new URL(appUrl()),
    title: {
      default: title,
      template: `%s — ${tenant.branding.storeName}`,
    },
    description,
    applicationName: tenant.branding.storeName,
    keywords: ["e-commerce", "shopify", "boutique", "headless", "mode"],
    openGraph: {
      type: "website",
      title,
      description,
      siteName: tenant.branding.storeName,
      images: [tenant.seo.ogImageUrl ?? "/og-default.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [tenant.seo.ogImageUrl ?? "/og-default.png"],
    },
    icons: {
      icon: tenant.branding.faviconUrl ?? "/icon-192.png",
      apple: "/apple-icon.png",
    },
    robots: { index: true, follow: true },
    manifest: "/manifest.webmanifest",
  };
}
