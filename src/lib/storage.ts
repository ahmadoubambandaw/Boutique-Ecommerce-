import "server-only";
import { randomUUID } from "node:crypto";

/**
 * Image upload to Supabase Storage (public bucket `product-images`).
 *
 * Runs server-side with the service-role key so uploads bypass storage RLS —
 * the calling server action is already gated by an admin session. Reads stay
 * public because the bucket is public.
 *
 * Config (env):
 *   SUPABASE_URL               e.g. https://xxxx.supabase.co  (public)
 *   SUPABASE_SERVICE_ROLE_KEY  secret — Supabase → Settings → API
 */

const BUCKET = "product-images";

/** Known project URL fallback so only the secret key must be configured. */
const DEFAULT_SUPABASE_URL = "https://ggqxiaffhawkjzzhvpze.supabase.co";

function supabaseUrl(): string {
  return (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL
  ).replace(/\/$/, "");
}

function serviceKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}

export function isUploadConfigured(): boolean {
  return Boolean(serviceKey());
}

function extFor(type: string, name: string): string {
  const fromName = name.includes(".") ? name.split(".").pop() : "";
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  };
  return map[type] ?? "jpg";
}

/** Upload a file and return its public URL, or throw on failure. */
export async function uploadImage(file: File): Promise<string> {
  const key = serviceKey();
  if (!key) {
    throw new Error("upload-not-configured");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Le fichier doit être une image.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image trop lourde (max 5 Mo).");
  }

  const base = supabaseUrl();
  const ext = extFor(file.type, file.name);
  const path = `${randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const res = await fetch(
    `${base}/storage/v1/object/${BUCKET}/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": file.type,
        "x-upsert": "true",
        "cache-control": "public, max-age=31536000",
      },
      body: bytes,
    },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`storage ${res.status}: ${detail.slice(0, 200)}`);
  }

  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}
