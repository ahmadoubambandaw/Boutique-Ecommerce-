import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/auth/admin-session";

/**
 * Edge middleware.
 *
 * 1. Multi-tenant routing — resolves the canonical tenant host from the request
 *    and forwards it as `x-tenant-host` so server components resolve the tenant
 *    deterministically (the DB lookup itself runs server-side, since the edge
 *    runtime can't open a Postgres connection). A `?__tenant=slug` query or
 *    `tenant_preview` cookie overrides the host for local/staging previews.
 * 2. Admin protection — gates `/admin/*` (see below).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Tenant host resolution ────────────────────────────────
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "").split(":")[0];
  const host = (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    ""
  )
    .split(":")[0]!
    .toLowerCase();

  // Preview override: /path?__tenant=aurora  → serve the "aurora" storefront.
  const previewSlug =
    request.nextUrl.searchParams.get("__tenant") ??
    request.cookies.get("tenant_preview")?.value ??
    null;

  const tenantHost =
    previewSlug && rootDomain ? `${previewSlug}.${rootDomain}` : host;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-host", tenantHost);

  const pass = () =>
    NextResponse.next({ request: { headers: requestHeaders } });

  // ── Admin protection ──────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return pass();

    const demoMode = !process.env.DATABASE_URL;
    const session = await verifyAdminSession(
      request.cookies.get(ADMIN_COOKIE)?.value,
    );

    if (!session) {
      if (demoMode) return pass();
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/admin/super") && session.role !== "super_admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  // Persist a preview selection so it survives client navigation.
  const res = pass();
  if (request.nextUrl.searchParams.has("__tenant") && previewSlug) {
    res.cookies.set("tenant_preview", previewSlug, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }
  return res;
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|txt|xml|webmanifest)$).*)"],
};
