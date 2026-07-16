/**
 * Seed the first Super Admin account.
 *
 * Usage:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='strong-pass' node scripts/seed-admin.mjs
 *
 * Requires DATABASE_URL to be set (and the schema pushed: `npm run db:push`).
 * The email should also be listed in SUPER_ADMIN_EMAILS.
 */
import { randomBytes, randomUUID, scrypt } from "node:crypto";
import { promisify } from "node:util";
import postgres from "postgres";

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

const url = process.env.DATABASE_URL;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!url) throw new Error("DATABASE_URL is required.");
if (!email || !password) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
}

const sql = postgres(url, { prepare: false, max: 1 });

const passwordHash = await hashPassword(password);
await sql`
  INSERT INTO admin_users (id, tenant_id, email, password_hash, role)
  VALUES (${randomUUID()}, NULL, ${email.toLowerCase()}, ${passwordHash}, 'super_admin')
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'super_admin'
`;

console.log(`✓ Super Admin seeded: ${email}`);
await sql.end();
