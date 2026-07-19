import { recordVisit } from "@/lib/commerce/visits";

export const runtime = "nodejs";

/** Lightweight visit beacon — called once per storefront session. */
export async function POST() {
  try {
    await recordVisit();
  } catch {
    /* never fail a page over analytics */
  }
  return new Response(null, { status: 204 });
}
