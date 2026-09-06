import "server-only";
import { sql } from "drizzle-orm";
import { getDb } from "./client";
import { captureMessage } from "@/lib/monitoring";

/**
 * Wake a hibernated Supabase project.
 *
 * Free-tier projects hibernate after a period of inactivity. Supabase wakes
 * them on "the next supported request" — but a *direct Postgres connection*
 * (what Drizzle uses) is NOT one of them: it just times out. Only a request to
 * the platform HTTP APIs (PostgREST, Auth…) triggers the wake-up.
 *
 * That is why a hibernated project can stay down indefinitely while the site
 * hammers it with SQL: the traffic never counts. This module issues the HTTP
 * request that does count, then polls until Postgres answers.
 */

const DEFAULT_SUPABASE_URL = "https://ggqxiaffhawkjzzhvpze.supabase.co";

/** Publishable ("anon") key — public by design, safe to ship client-side. */
const DEFAULT_PUBLISHABLE_KEY = "sb_publishable_nt5k5TSBw-eePD6Od2sY2Q_vJJXs9YY";

function baseUrl(): string {
  return (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL
  ).replace(/\/$/, "");
}

function anonKey(): string {
  return (
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_PUBLISHABLE_KEY
  );
}

/** Fire the HTTP request that Supabase counts as activity. */
export async function pingRestApi(): Promise<{ ok: boolean; status: number }> {
  const key = anonKey();
  try {
    const res = await fetch(`${baseUrl()}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    // Any HTTP answer (even 401) proves the platform is serving the project.
    return { ok: true, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

/** True when Postgres accepts a trivial query. */
export async function pingPostgres(): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    await db.execute(sql`select 1`);
    return true;
  } catch {
    return false;
  }
}

export type WakeResult = {
  awake: boolean;
  restStatus: number;
  attempts: number;
  elapsedMs: number;
};

/**
 * Ping the REST API, then poll Postgres until it answers or the budget runs
 * out. Waking a hibernated project typically takes a few tens of seconds.
 */
export async function wakeDatabase(budgetMs = 45_000): Promise<WakeResult> {
  const started = Date.now();

  // Already up? Nothing to do.
  if (await pingPostgres()) {
    return { awake: true, restStatus: 200, attempts: 0, elapsedMs: Date.now() - started };
  }

  const { status } = await pingRestApi();

  let attempts = 0;
  while (Date.now() - started < budgetMs) {
    attempts += 1;
    if (await pingPostgres()) {
      return { awake: true, restStatus: status, attempts, elapsedMs: Date.now() - started };
    }
    await new Promise((r) => setTimeout(r, 3_000));
  }

  captureMessage("database still hibernated after wake attempt", {
    restStatus: status,
    attempts,
  });
  return { awake: false, restStatus: status, attempts, elapsedMs: Date.now() - started };
}
