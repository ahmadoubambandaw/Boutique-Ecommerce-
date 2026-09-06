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

/**
 * The Supabase project reference, read from DATABASE_URL so this module can
 * never point at a stale project. Both connection shapes carry it:
 *   direct  postgresql://postgres:…@db.<ref>.supabase.co:5432/postgres
 *   pooler  postgresql://<role>.<ref>:…@aws-0-<region>.pooler.supabase.com:6543/…
 */
export function projectRef(): string | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  try {
    const u = new URL(url);
    const fromHost = /^db\.([a-z0-9]+)\.supabase\.co$/i.exec(u.hostname);
    if (fromHost?.[1]) return fromHost[1];
    const fromUser = /\.([a-z0-9]{20,})$/i.exec(decodeURIComponent(u.username));
    if (fromUser?.[1]) return fromUser[1];
  } catch {
    /* malformed URL — fall through */
  }
  return null;
}

function baseUrl(): string | null {
  const explicit = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const ref = projectRef();
  return ref ? `https://${ref}.supabase.co` : null;
}

function anonKey(): string | null {
  return (
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    null
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
  const base = baseUrl();
  if (!base) return { ok: false, status: 0, body: "no Supabase project ref" };

  // The key is optional — without it the gateway answers 401, which is still
  // enough to tell a served project from a paused one. For keeping a project
  // awake, prefer pingAuthHealth(): a rejected request is a weaker signal.
  const key = anonKey();
  const headers: Record<string, string> = key
    ? { apikey: key, Authorization: `Bearer ${key}` }
    : {};
  try {
    const res = await fetch(`${base}/rest/v1/`, {
      headers,
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

/**
 * Ping the Auth health endpoint. Unlike PostgREST it needs no API key, so it
 * answers 200 rather than 401 — which matters when the point of the request is
 * to register as project activity: a rejected call may not count.
 */
export async function pingAuthHealth(): Promise<{ ok: boolean; status: number }> {
  const base = baseUrl();
  if (!base) return { ok: false, status: 0 };
  try {
    const res = await fetch(`${base}/auth/v1/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
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

/* ─────────────────────────────────────────────────────────────
   Connection endpoint probe
   ───────────────────────────────────────────────────────────── */

export type ProbeResult = {
  /** Endpoint tried, with the password redacted — safe to return over HTTP. */
  endpoint: string;
  ok: boolean;
  error?: string;
};

function redact(url: string): string {
  try {
    const u = new URL(url);
    if (u.password) u.password = "***";
    return u.toString();
  } catch {
    return "invalid URL";
  }
}

/**
 * Supabase serves the connection pooler from regional load balancers whose
 * hostname carries an index (`aws-0-…`, `aws-1-…`) that differs per project
 * and is only visible in the dashboard. When the dashboard is unreachable the
 * index has to be discovered empirically, so build the plausible variants of
 * the configured URL and let the caller find out which one answers.
 */
export function connectionCandidates(url: string): string[] {
  const seen = new Set<string>([url]);
  const swap = (from: string, to: string) => {
    if (url.includes(from)) seen.add(url.replace(from, to));
  };
  swap("aws-0-", "aws-1-");
  swap("aws-1-", "aws-0-");
  return [...seen];
}

/** Try each candidate endpoint once and report which ones accept a query. */
export async function probeConnections(): Promise<ProbeResult[]> {
  const url = process.env.DATABASE_URL;
  if (!url) return [{ endpoint: "none", ok: false, error: "DATABASE_URL not set" }];

  // Imported lazily: this diagnostic path must not pull the driver into the
  // module graph of every request that merely imports the wake helpers.
  const { default: postgres } = await import("postgres");

  const results: ProbeResult[] = [];
  for (const candidate of connectionCandidates(url)) {
    const client = postgres(candidate, {
      prepare: false,
      max: 1,
      connect_timeout: 10,
      idle_timeout: 5,
    });
    try {
      await client`select 1`;
      results.push({ endpoint: redact(candidate), ok: true });
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      results.push({ endpoint: redact(candidate), ok: false, error: err.message.slice(0, 200) });
    }
    await client.end({ timeout: 5 }).catch(() => {});
  }
  return results;
}

/* ─────────────────────────────────────────────────────────────
   Pooler cluster lookup
   ───────────────────────────────────────────────────────────── */

/** Regional pooler clusters Supabase spreads projects across. */
const POOLER_CLUSTERS = ["aws-0", "aws-1"] as const;

export type ClusterResult = {
  host: string;
  /** True when this cluster knows the project (whatever the credentials). */
  hostsProject: boolean;
  detail: string;
};

/**
 * Find which pooler cluster serves a project, using no credentials.
 *
 * Supavisor resolves the tenant *before* authenticating, so a deliberately
 * invalid password yields two distinguishable answers: "Tenant or user not
 * found" on a cluster that does not host the project, versus an authentication
 * failure on the one that does. That is enough to identify the right hostname
 * when the dashboard — the only place it is displayed — is unreachable.
 */
export async function findPoolerCluster(
  ref: string,
  region: string,
): Promise<ClusterResult[]> {
  const { default: postgres } = await import("postgres");
  const results: ClusterResult[] = [];

  for (const cluster of POOLER_CLUSTERS) {
    const host = `${cluster}-${region}.pooler.supabase.com`;
    const client = postgres({
      host,
      port: 6543,
      database: "postgres",
      username: `postgres.${ref}`,
      password: "invalid-probe-password",
      prepare: false,
      max: 1,
      connect_timeout: 10,
      idle_timeout: 5,
      ssl: "require",
    });
    try {
      await client`select 1`;
      // Should not happen with a bogus password, but a success still proves it.
      results.push({ host, hostsProject: true, detail: "connected" });
    } catch (e) {
      const msg = (e instanceof Error ? e.message : String(e)).slice(0, 160);
      const unknownTenant = /tenant|user not found|ENOTFOUND/i.test(msg);
      results.push({ host, hostsProject: !unknownTenant, detail: msg });
    }
    await client.end({ timeout: 5 }).catch(() => {});
  }
  return results;
}
