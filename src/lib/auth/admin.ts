import "server-only";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { adminUsers, type AdminUserRow } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "./password";
import type { AdminRole } from "./admin-session";

export async function findAdminByEmail(email: string): Promise<AdminUserRow | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase()))
    .limit(1);
  return row ?? null;
}

export async function findAdminById(id: string): Promise<AdminUserRow | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);
  return row ?? null;
}

/** Update an admin's own e-mail and/or password. */
export async function updateAdminCredentials(
  id: string,
  input: { email?: string; password?: string },
): Promise<void> {
  const db = getDb();
  if (!db) return;
  const patch: Partial<{ email: string; passwordHash: string }> = {};
  if (input.email) patch.email = input.email.toLowerCase();
  if (input.password) patch.passwordHash = await hashPassword(input.password);
  if (Object.keys(patch).length === 0) return;
  await db.update(adminUsers).set(patch).where(eq(adminUsers.id, id));
}

/** Create an admin/staff account. Used by seeding and merchant onboarding. */
export async function createAdmin(input: {
  email: string;
  password: string;
  role: AdminRole;
  tenantId?: string | null;
}): Promise<AdminUserRow | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .insert(adminUsers)
    .values({
      id: crypto.randomUUID(),
      email: input.email.toLowerCase(),
      passwordHash: await hashPassword(input.password),
      role: input.role,
      tenantId: input.tenantId ?? null,
    })
    .onConflictDoNothing()
    .returning();
  return row ?? null;
}

/** Verify email + password. Returns the admin row on success. */
export async function verifyAdminCredentials(
  email: string,
  password: string,
): Promise<AdminUserRow | null> {
  const admin = await findAdminByEmail(email);
  if (!admin) return null;
  const ok = await verifyPassword(password, admin.passwordHash);
  return ok ? admin : null;
}

/** Emails allowed to act as platform Super Admins (bootstrap allow-list). */
export function isSuperAdminEmail(email: string): boolean {
  const list = (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}
