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

/**
 * Local circuit breaker.
 *
 * Supabase's pooler opens its own breaker after repeated failed connections
 * ("too many authentication failures, new connections are temporarily
 * blocked"), which keeps the project blocked even once the database returns.
 * Retrying on every request is therefore actively harmful: after a failure we
 * fail fast for a cool-down window instead of piling on more attempts.
 */
const CIRCUIT_COOLDOWN_MS = 30_000;
let _openUntil = 0;

/** Record a failed database interaction — opens the breaker. */
export function noteDbFailure(): void {
  _openUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
}

/** Record a successful interaction — closes the breaker immediately. */
export function noteDbSuccess(): void {
  _openUntil = 0;
}

export function isDbCircuitOpen(): boolean {
  return Date.now() < _openUntil;
}

export function getDb(): DB | null {
  // Fail fast while cooling down, so we stop tripping the pooler's breaker.
  if (isDbCircuitOpen()) return null;
  if (_db !== undefined) return _db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    _db = null;
    return _db;
  }

  // `prepare: false` keeps compatibility with serverless poolers (pgbouncer).
  // Serverless: every lambda instance owns its own pool, so cap it at ONE
  // connection and release it quickly — otherwise concurrent instances exhaust
  // the database's connection limit and every query starts failing.
  _sql = postgres(url, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  _db = drizzle(_sql, { schema });
  return _db;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export { schema };
