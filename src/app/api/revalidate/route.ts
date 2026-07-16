import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { revalidateTag } from "next/cache";
import { TAGS } from "@/lib/shopify";

/**
 * Shopify webhook receiver.
 *
 * Wire these webhook topics in the Shopify app (products/update, collections/update,
 * inventory_levels/update, orders/create). On each event we invalidate the
 * matching Next.js cache tag so the storefront reflects Shopify instantly —
 * keeping Shopify the single source of truth without ever duplicating data.
 */
export async function POST(request: Request) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  const hmac = request.headers.get("x-shopify-hmac-sha256") ?? "";
  const topic = request.headers.get("x-shopify-topic") ?? "";
  const raw = await request.text();

  // Verify the HMAC signature to reject spoofed requests.
  if (secret) {
    const digest = crypto
      .createHmac("sha256", secret)
      .update(raw, "utf8")
      .digest("base64");
    const valid =
      hmac.length === digest.length &&
      crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(digest));
    if (!valid) {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
  }

  if (topic.startsWith("products") || topic.startsWith("inventory")) {
    revalidateTag(TAGS.products);
  }
  if (topic.startsWith("collections")) {
    revalidateTag(TAGS.collections);
  }

  return NextResponse.json({ revalidated: true, topic });
}
