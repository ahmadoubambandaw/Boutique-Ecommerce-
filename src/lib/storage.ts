import "server-only";
import { randomUUID } from "node:crypto";
import { projectRef } from "@/lib/db/wake";

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

/**
 * Project URL. Derived from DATABASE_URL when not set explicitly, so pointing
 * the app at a different Supabase project never leaves storage aimed at the
 * old one.
 */
function supabaseUrl(): string | null {
  const explicit = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const ref = projectRef();
  return ref ? `https://${ref}.supabase.co` : null;
}

function serviceKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}

export function isUploadConfigured(): boolean {
  return Boolean(serviceKey() && supabaseUrl());
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
  if (!base) {
    throw new Error("upload-not-configured");
  }
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
