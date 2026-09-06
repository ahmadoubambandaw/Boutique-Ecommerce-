import "server-only";
import { sql } from "drizzle-orm";
import { getDb, noteDbFailure, noteDbSuccess } from "./client";
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

/**
 * Legacy anon key (JWT) — public by design, safe to ship client-side. Preferred
 * over the newer `sb_publishable_…` format here because every Supabase gateway
 * version accepts it.
 */
const DEFAULT_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdncXhpYWZmaGF3a2p6emh2cHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMTI2MjQsImV4cCI6MjA5OTc4ODYyNH0.RJHNfoP4xvrrQd2KLGOQBuhM4rcxVC5c5X97QK5ZQ-c";

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

/**
 * Fire the HTTP request that Supabase counts as activity. The response body is
 * returned too: a paused/hibernated project answers with a descriptive payload,
 * which is the only way to tell that state apart from an auth rejection.
 */
export async function pingRestApi(): Promise<{
  ok: boolean;
  status: number;
  body: string;
}> {
  const key = anonKey();
  try {
    const res = await fetch(`${baseUrl()}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const body = await res.text().catch(() => "");
    // Any HTTP answer (even 401) proves the platform is serving the project.
    return { ok: true, status: res.status, body: body.slice(0, 300) };
  } catch (e) {
    return { ok: false, status: 0, body: String(e).slice(0, 300) };
  }
}

/** True when Postgres accepts a trivial query. */
export async function pingPostgres(): Promise<boolean> {
  return (await tryQuery()) === "";
}

export type WakeResult = {
  awake: boolean;
  restStatus: number;
  restBody: string;
  pgError: string;
  attempts: number;
  elapsedMs: number;
};

/**
 * Run a trivial query, returning the failure message when it does not work.
 * A health probe is an explicit request to test the database, so it clears the
 * local cool-down first rather than being short-circuited by it.
 */
async function tryQuery(): Promise<string> {
  noteDbSuccess();
  const db = getDb();
  if (!db) return "no DATABASE_URL";
  try {
    await db.execute(sql`select 1`);
    return "";
  } catch (e) {
    noteDbFailure();
    const err = e instanceof Error ? e : new Error(String(e));
    const cause = (err as { cause?: unknown }).cause;
    return `${err.message}${cause ? ` | cause: ${String(cause)}` : ""}`.slice(0, 300);
  }
}

/**
 * Ping the REST API, then poll Postgres until it answers or the budget runs
 * out. Waking a hibernated project typically takes a few tens of seconds.
 */
export async function wakeDatabase(budgetMs = 45_000): Promise<WakeResult> {
  const started = Date.now();

  const { status, body } = await pingRestApi();

  let attempts = 0;
  let pgError = "";
  while (Date.now() - started < budgetMs) {
    attempts += 1;
    pgError = await tryQuery();
    if (!pgError) {
      return {
        awake: true,
        restStatus: status,
        restBody: body,
        pgError: "",
        attempts,
        elapsedMs: Date.now() - started,
      };
    }
    await new Promise((r) => setTimeout(r, 3_000));
  }

  captureMessage("database still unreachable after wake attempt", {
    restStatus: status,
    restBody: body,
    pgError,
    attempts,
  });
  return {
    awake: false,
    restStatus: status,
    restBody: body,
    pgError,
    attempts,
    elapsedMs: Date.now() - started,
  };
}
