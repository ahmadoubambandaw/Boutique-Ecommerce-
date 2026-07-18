import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { CheckoutCustomer, PaymentProviderName } from "./types";

/**
 * Pending-checkout state, carried across the gateway redirect in a signed
 * httpOnly cookie (no DB needed on single-store deployments). The payload is
 * HMAC-signed with AUTH_SECRET so it cannot be tampered with; prices are
 * re-verified from Shopify at order creation anyway.
 */

export type PendingCheckout = {
  reference: string;
  provider: PaymentProviderName;
  token: string;
  customer: CheckoutCustomer;
  lines: { variantId: string; quantity: number }[];
  exp: number;
};

const COOKIE = "boutique_pending_checkout";

function secret(): string {
  return process.env.AUTH_SECRET ?? "dev-only-secret";
}

function sign(data: string): string {
  return crypto.createHmac("sha256", secret()).update(data).digest("base64url");
}

export async function setPendingCheckout(
  pending: Omit<PendingCheckout, "exp">,
): Promise<void> {
  const payload: PendingCheckout = {
    ...pending,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1h
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  (await cookies()).set(COOKIE, `${data}.${sign(data)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
}

export async function readPendingCheckout(): Promise<PendingCheckout | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [data, sig] = raw.split(".");
  if (!data || !sig) return null;
  const expected = sign(data);
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString(),
    ) as PendingCheckout;
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function clearPendingCheckout(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
