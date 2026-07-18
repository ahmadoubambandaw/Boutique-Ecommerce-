"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  verifyAdminCredentials,
  isSuperAdminEmail,
  findAdminById,
  updateAdminCredentials,
} from "./admin";
import { verifyPassword } from "./password";
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

export type UpdateAccountState = { ok?: boolean; error?: string };

/**
 * Let the signed-in admin change their own e-mail and/or password. The current
 * password is required to authorise the change. On success the session cookie
 * is re-issued so a new e-mail is reflected immediately.
 */
export async function updateAdminAccountAction(
  _prev: UpdateAccountState,
  formData: FormData,
): Promise<UpdateAccountState> {
  const session = await getAdminSession();
  if (!session) return { error: "Session expirée. Reconnectez-vous." };

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newEmail = String(formData.get("email") ?? "").trim().toLowerCase();
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword) {
    return { error: "Saisissez votre mot de passe actuel." };
  }

  const admin = await findAdminById(session.sub);
  if (!admin) return { error: "Compte introuvable." };

  const ok = await verifyPassword(currentPassword, admin.passwordHash);
  if (!ok) return { error: "Mot de passe actuel incorrect." };

  const patch: { email?: string; password?: string } = {};

  if (newEmail && newEmail !== admin.email) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newEmail)) {
      return { error: "E-mail invalide." };
    }
    patch.email = newEmail;
  }

  if (newPassword) {
    if (newPassword.length < 8) {
      return { error: "Le nouveau mot de passe doit faire au moins 8 caractères." };
    }
    if (newPassword !== confirmPassword) {
      return { error: "Les mots de passe ne correspondent pas." };
    }
    patch.password = newPassword;
  }

  if (!patch.email && !patch.password) {
    return { error: "Aucune modification à enregistrer." };
  }

  try {
    await updateAdminCredentials(session.sub, patch);
  } catch {
    return { error: "E-mail déjà utilisé ou erreur d'enregistrement." };
  }

  // Re-issue the session so the (possibly new) e-mail is reflected.
  const token = await signAdminSession({
    sub: session.sub,
    email: patch.email ?? session.email,
    role: session.role,
    tenantId: session.tenantId,
  });
  await setCookie(token);

  return { ok: true };
}
