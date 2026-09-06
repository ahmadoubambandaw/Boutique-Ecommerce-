import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { wakeDatabase, pingPostgres } from "@/lib/db/wake";

/**
 * Database health probe — and hibernation wake-up.
 *
 * GET  /api/health/db        → report whether Postgres answers (fast)
 * GET  /api/health/db?wake=1 → ping the Supabase REST API to wake a hibernated
 *                              project, then poll until Postgres answers
 *
 * The wake path exists because a hibernated Supabase project ignores direct
 * Postgres traffic: only an HTTP API call revives it. Opening this URL in a
 * browser is therefore enough to bring the store back, with no dashboard
 * access required.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { ok: false, reason: "DATABASE_URL not configured" },
      { status: 503 },
    );
  }

  const wake = new URL(request.url).searchParams.get("wake");

  if (wake) {
    const result = await wakeDatabase();
    return NextResponse.json(
      {
        ok: result.awake,
        ...result,
        message: result.awake
          ? "Base de données réveillée et opérationnelle."
          : "La base ne répond toujours pas. Réessayez dans une minute.",
      },
      { status: result.awake ? 200 : 503 },
    );
  }

  const up = await pingPostgres();
  return NextResponse.json(
    {
      ok: up,
      message: up
        ? "Base de données opérationnelle."
        : "Base injoignable. Ouvrez /api/health/db?wake=1 pour la réveiller.",
    },
    { status: up ? 200 : 503 },
  );
}
