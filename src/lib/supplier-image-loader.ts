"use client";

/**
 * Custom `next/image` loader for supplier product photography.
 *
 * Routes senboutiquesecurite.com images through /api/img, which resizes with
 * a sharper resampling kernel and applies a mild unsharp mask — see that
 * route's comment for why (600×600 sources, already jpeg-recompressed once).
 *
 * Everything else (our own hosted photos, the GSE placeholder) is left
 * untouched: it is passed straight through rather than reprocessed, since
 * only the supplier photos are the ones the sharpening was written for.
 */
const SUPPLIER_HOSTS = ["senboutiquesecurite.com", "www.senboutiquesecurite.com"];

export function supplierImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const isSupplierPhoto = SUPPLIER_HOSTS.some(
    (host) => src.startsWith(`https://${host}/`) || src.startsWith(`http://${host}/`),
  );
  if (!isSupplierPhoto) return src;

  const params = new URLSearchParams({
    url: src,
    w: String(width),
    q: String(quality ?? 82),
  });
  return `/api/img?${params.toString()}`;
}
