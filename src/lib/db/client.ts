import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Lazy, singleton database client.
 *
 * Returns `null` when `DATABASE_URL` is not configured so the app builds and
 * runs on demo data without any infrastructure. Every caller must handle the
 * null case (the tenant repository does this centrally).
 */

type DB = PostgresJsDatabase<typeof schema>;

let _db: DB | null | undefined;
let _sql: ReturnType<typeof postgres> | undefined;

export function getDb(): DB | null {
  if (_db !== undefined) return _db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    _db = null;
    return _db;
  }

  // `prepare: false` keeps compatibility with serverless poolers (pgbouncer).
  _sql = postgres(url, { prepare: false, max: 5 });
  _db = drizzle(_sql, { schema });
  return _db;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export { schema };
