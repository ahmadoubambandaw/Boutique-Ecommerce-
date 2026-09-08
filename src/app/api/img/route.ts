import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";

/**
 * Sharpening proxy for supplier product photography.
 *
 * The GSE catalogue's photos come from the fournisseur's WooCommerce media
 * library, and every one of them tops out at 600×600 px — that is the largest
 * `srcset` entry WordPress ever generated for them, so there is no hidden
 * higher-resolution original to fall back to. Several of the files also carry
 * a "Compressed by jpeg-recompress" marker, meaning they were already
 * re-encoded once, which softens edges further.
 *
 * We cannot recover detail that was never captured, but a resize with a sharp
 * resampling kernel plus a mild unsharp mask measurably improves perceived
 * clarity over what a browser's own CSS upscaling produces — the browser only
 * interpolates, it never re-sharpens afterwards.
 *
 * The upstream host is allow-listed to keep this from becoming an open image
 * proxy (no arbitrary URL should be fetchable through our own domain).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_HOSTS = new Set([
  "senboutiquesecurite.com",
  "www.senboutiquesecurite.com",
]);

const MAX_WIDTH = 1600;
const MIN_QUALITY = 40;
const MAX_QUALITY = 90;
const DEFAULT_QUALITY = 82;

/** Never enlarge past this multiple of the source — sharpening cannot invent
 * detail, so stretching a 600px photo to fill a 1600px hero would just
 * produce a bigger blur. */
const MAX_UPSCALE = 1.5;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const src = searchParams.get("url");
  if (!src) {
    return NextResponse.json({ error: "missing url" }, { status: 400 });
  }

  let upstreamUrl: URL;
  try {
    upstreamUrl = new URL(src);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }
  if (upstreamUrl.protocol !== "https:" || !ALLOWED_HOSTS.has(upstreamUrl.hostname)) {
    return NextResponse.json({ error: "host not allowed" }, { status: 400 });
  }

  const requestedWidth = Number(searchParams.get("w"));
  const width = Number.isFinite(requestedWidth) && requestedWidth > 0
    ? Math.min(Math.round(requestedWidth), MAX_WIDTH)
    : 800;

  const requestedQuality = Number(searchParams.get("q"));
  const quality = Number.isFinite(requestedQuality)
    ? Math.min(Math.max(Math.round(requestedQuality), MIN_QUALITY), MAX_QUALITY)
    : DEFAULT_QUALITY;

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl.toString(), {
      signal: AbortSignal.timeout(15_000),
      headers: { "user-agent": "GSE-image-proxy/1.0" },
    });
  } catch {
    return NextResponse.json({ error: "upstream unreachable" }, { status: 502 });
  }
  if (!upstream.ok) {
    return NextResponse.json({ error: "upstream error" }, { status: 502 });
  }

  const bytes = Buffer.from(await upstream.arrayBuffer());

  const accept = request.headers.get("accept") ?? "";
  const format: "avif" | "webp" | "jpeg" = accept.includes("image/avif")
    ? "avif"
    : accept.includes("image/webp")
      ? "webp"
      : "jpeg";

  try {
    const probe = sharp(bytes, { failOn: "none" }).rotate();
    const meta = await probe.metadata();
    const ceiling = Math.round((meta.width ?? width) * MAX_UPSCALE);
    const targetWidth = Math.min(width, ceiling);

    let pipeline = probe
      .resize({ width: targetWidth, withoutEnlargement: false, kernel: "lanczos3" })
      .sharpen({ sigma: 1, m1: 1, m2: 0.5 })
      .normalise();

    const out =
      format === "avif"
        ? await pipeline.avif({ quality }).toBuffer()
        : format === "webp"
          ? await pipeline.webp({ quality }).toBuffer()
          : await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();

    return new NextResponse(new Uint8Array(out), {
      headers: {
        "content-type": `image/${format}`,
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
}
