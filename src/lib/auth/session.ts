import "server-only";
import { cookies } from "next/headers";

/** httpOnly cookie holding the Shopify customer access token. */
const SESSION_COOKIE = "boutique_customer_token";

export async function setCustomerSession(token: string, expiresAt: string) {
  const store = await cookies();
  const maxAge = Math.max(
    0,
    Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
  );
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAge || 60 * 60 * 24 * 7,
  });
}

export async function getCustomerToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function clearCustomerSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
