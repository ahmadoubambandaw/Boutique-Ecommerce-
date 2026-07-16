/**
 * Stateless admin session tokens, signed with HMAC-SHA256 via Web Crypto so the
 * SAME code verifies in the edge middleware and in Node server components.
 *
 * Token format: `<base64url(payload)>.<base64url(signature)>`.
 * No secrets or DB lookups are needed to verify — only AUTH_SECRET.
 */

export type AdminRole = "super_admin" | "owner" | "staff";

export type AdminSession = {
  sub: string; // admin user id
  email: string;
  role: AdminRole;
  tenantId: string | null;
  exp: number; // unix seconds
};

export const ADMIN_COOKIE = "boutique_admin_session";
const TTL_SECONDS = 60 * 60 * 8; // 8 hours

function secret(): string {
  return process.env.AUTH_SECRET ?? "";
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str: string): Uint8Array {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/** Encode a string to bytes (typed as BufferSource for Web Crypto). */
function bytes(str: string): BufferSource {
  return new TextEncoder().encode(str) as unknown as BufferSource;
}

async function key(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    bytes(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Create a signed session token for the given admin (excluding `exp`). */
export async function signAdminSession(
  payload: Omit<AdminSession, "exp">,
): Promise<string> {
  const full: AdminSession = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + TTL_SECONDS,
  };
  const data = b64urlEncode(new TextEncoder().encode(JSON.stringify(full)));
  const sig = await crypto.subtle.sign("HMAC", await key(), bytes(data));
  return `${data}.${b64urlEncode(new Uint8Array(sig))}`;
}

/** Verify a token and return the session, or null if invalid/expired. */
export async function verifyAdminSession(
  token: string | undefined | null,
): Promise<AdminSession | null> {
  if (!token || !secret()) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;

  const valid = await crypto.subtle.verify(
    "HMAC",
    await key(),
    b64urlDecode(sig) as unknown as BufferSource,
    bytes(data),
  );
  if (!valid) return null;

  try {
    const session = JSON.parse(new TextDecoder().decode(b64urlDecode(data))) as AdminSession;
    if (session.exp * 1000 < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}
