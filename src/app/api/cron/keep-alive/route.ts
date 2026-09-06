import { NextResponse } from "next/server";
import { pingRestApi, pingAuthHealth, pingPostgres } from "@/lib/db/wake";

/**
 * Keeps the Supabase project out of hibernation.
 *
 * A free-tier project pauses after a stretch of inactivity, and — as this store
 * learned the hard way — only requests to the platform HTTP APIs count as
 * activity. Direct Postgres connections do not, so ordinary customer traffic
 * (which reaches Postgres through the pooler) is NOT enough on its own to keep
 * the project awake. This route pings PostgREST, which does count, and then
 * confirms Postgres answers.
 *
 * Scheduled daily by `vercel.json`. Vercel sends `Authorization: Bearer
 * $CRON_SECRET` when that variable is set; the check is skipped when it isn't,
 * so the route works with no configuration and can also be pinged by a free
 * external monitor (UptimeRobot, cron-job.org…) as a second line of defence.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  // Two pings on purpose: /auth/v1/health answers 200 without a key, while
  // /rest/v1/ returns 401 unless SUPABASE_ANON_KEY is set — and a rejected
  // request is not a reliable activity signal.
  const [auth, rest] = await Promise.all([pingAuthHealth(), pingRestApi()]);
  const db = await pingPostgres();

  return NextResponse.json({
    ok: auth.ok && db,
    authStatus: auth.status,
    restStatus: rest.status,
    database: db ? "awake" : "unreachable",
    at: new Date().toISOString(),
  });
}
