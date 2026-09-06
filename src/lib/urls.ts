/**
 * Canonical application URL.
 *
 * Order matters. `VERCEL_URL` is the *deployment* hostname — it changes on
 * every build, so using it for canonical links and Open Graph images meant
 * shared links (WhatsApp, Facebook) broke as soon as the next deploy shipped,
 * and search engines saw a different canonical each time. Prefer the stable
 * production hostname, and keep `VERCEL_URL` only as a preview-branch fallback.
 *
 *   NEXT_PUBLIC_APP_URL              explicit override (use for a custom domain)
 *   VERCEL_PROJECT_PRODUCTION_URL    stable production hostname
 *   VERCEL_URL                       this deployment (previews only)
 */
export function appUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
