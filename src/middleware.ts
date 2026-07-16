import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/auth/admin-session";

/**
 * Edge middleware — protects the admin area.
 *
 * - `/admin/login` is always public.
 * - Valid session required for `/admin/*`; `/admin/super` also requires the
 *   `super_admin` role.
 * - In demo mode (no DATABASE_URL) the admin area stays open so the showcase
 *   dashboard is browsable without infrastructure. As soon as a database is
 *   configured, real authentication is enforced.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const demoMode = !process.env.DATABASE_URL;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const session = await verifyAdminSession(token);

  if (!session) {
    if (demoMode) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Super Admin area is restricted to platform super admins.
  if (pathname.startsWith("/admin/super") && session.role !== "super_admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
