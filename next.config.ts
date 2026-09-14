import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Shopify is the single source of truth for all media.
    // We never store product images locally — they are served from Shopify's CDN.
    formats: ["image/avif", "image/webp"],
    /**
     * Trimmed from Next's 8-entry defaults (up to 3840px). Every distinct
     * width Next requests is a separate cache key through /api/img, which
     * fetches the supplier's slow shared host and re-processes with sharp on
     * every first hit — a real, felt delay for whichever customer happens to
     * be the first at a given screen size. Our supplier photos cap out at
     * 600×600px and the sharpening proxy already refuses to upscale past 1.5×
     * that, so any device width above ~900px was generating extra cold-cache
     * variants that all resolved to the exact same processed image anyway.
     * Fewer, purposeful breakpoints means visitors share cache entries sooner.
     */
    deviceSizes: [420, 640, 828, 1080],
    imageSizes: [40, 64, 96, 176, 256],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "*.myshopify.com" },
      // Native product photos uploaded to Supabase Storage.
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Supplier product photography, pending our own shots. Next/Image
      // re-encodes and caches these on our side, so the origin is hit once.
      { protocol: "https", hostname: "senboutiquesecurite.com" },
      { protocol: "https", hostname: "www.senboutiquesecurite.com" },
      // Demo catalogue imagery (used only when no Shopify store is connected).
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
