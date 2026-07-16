/**
 * Canonical application URL.
 *
 * Zero-config friendly: uses NEXT_PUBLIC_APP_URL when set, else auto-detects the
 * Vercel deployment URL, else falls back to localhost. This lets the app deploy
 * with NO environment variables while still producing correct absolute URLs
 * (Open Graph, canonical links, OAuth/Stripe redirects).
 */
export function appUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
