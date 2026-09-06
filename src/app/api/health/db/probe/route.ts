import { NextResponse } from "next/server";
import postgres from "postgres";

/**
 * Connection-endpoint probe.
 *
 * The configured pooler host started timing out (`CONNECT_TIMEOUT
 * aws-0-…pooler.supabase.com:6543`) while the project's HTTP APIs stayed up —
 * so the database is alive and only the connection endpoint is wrong. Supabase
 * moves projects between pooler hostnames (`aws-0-*` → `aws-1-*`) and offers
 * both transaction (6543) and session (5432) ports.
 *
 * This tries every plausible endpoint with the credentials already in
 * DATABASE_URL and reports which one accepts a connection. Credentials are
 * never echoed back.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Candidate = { label: string; url: string };

function candidates(base: string): Candidate[] {
  const out: Candidate[] = [];
  const seen = new Set<string>();

  const push = (label: string, url: URL) => {
    const key = `${url.hostname}:${url.port}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ label, url: url.toString() });
  };

  const original = new URL(base);
  push(`${original.hostname}:${original.port} (configuré)`, original);

  const hosts = new Set([original.hostname]);
  // Supabase renumbers pooler hostnames; try the neighbouring generations.
  const m = original.hostname.match(/^aws-(\d+)-(.+)$/);
  if (m) {
    for (const n of ["0", "1", "2"]) hosts.add(`aws-${n}-${m[2]}`);
  }

  for (const host of hosts) {
    for (const port of ["6543", "5432"]) {
      const u = new URL(base);
      u.hostname = host;
      u.port = port;
      push(`${host}:${port}`, u);
    }
  }

  return out;
}

async function probe(url: string): Promise<{ ok: boolean; error?: string }> {
  let client: ReturnType<typeof postgres> | null = null;
  try {
    client = postgres(url, {
      prepare: false,
      max: 1,
      idle_timeout: 5,
      connect_timeout: 8,
    });
    await client`select 1`;
    return { ok: true };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    const cause = (err as { cause?: unknown }).cause;
    return {
      ok: false,
      error: `${err.message}${cause ? ` | ${String(cause)}` : ""}`.slice(0, 160),
    };
  } finally {
    await client?.end({ timeout: 1 }).catch(() => undefined);
  }
}

export async function GET() {
  const base = process.env.DATABASE_URL;
  if (!base) {
    return NextResponse.json({ ok: false, reason: "DATABASE_URL not set" }, { status: 503 });
  }

  const results: { endpoint: string; ok: boolean; error?: string }[] = [];
  for (const c of candidates(base)) {
    const r = await probe(c.url);
    results.push({ endpoint: c.label, ...r });
    if (r.ok) break; // first working endpoint is enough
  }

  const working = results.find((r) => r.ok);
  return NextResponse.json(
    {
      ok: Boolean(working),
      working: working?.endpoint ?? null,
      results,
    },
    { status: working ? 200 : 503 },
  );
}
