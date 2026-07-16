"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminCredentials, isSuperAdminEmail } from "./admin";
import {
  ADMIN_COOKIE,
  signAdminSession,
  verifyAdminSession,
  type AdminSession,
} from "./admin-session";
import { isDbConfigured } from "@/lib/db/client";

export type AdminAuthState = { error?: string };

async function setCookie(token: string) {
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

/** Admin login server action. */
export async function adminLoginAction(
  _prev: AdminAuthState,
  formData: FormData,
): Promise<AdminAuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "E-mail et mot de passe requis." };
  }
  if (!isDbConfigured()) {
    return {
      error:
        "Mode démo : configurez une base de données pour activer l'authentification admin.",
    };
  }

  const admin = await verifyAdminCredentials(email, password);
  if (!admin) {
    return { error: "Identifiants invalides." };
  }

  // A super_admin role must also be on the bootstrap allow-list.
  const role =
    admin.role === "super_admin" && !isSuperAdminEmail(email)
      ? "owner"
      : admin.role;

  const token = await signAdminSession({
    sub: admin.id,
    email: admin.email,
    role,
    tenantId: admin.tenantId,
  });
  await setCookie(token);
  redirect("/admin");
}

/** Admin logout server action. */
export async function adminLogoutAction(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

/** Read the current admin session in server components (null if signed out). */
export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return verifyAdminSession(token);
}
