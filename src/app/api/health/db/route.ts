import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import {
  wakeDatabase,
  pingPostgres,
  probeConnections,
  projectRef,
  findPoolerCluster,
} from "@/lib/db/wake";

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
  const url = new URL(request.url);

  // Which pooler cluster hosts a given project? Uses no credentials, and only
  // ever contacts Supabase's own pooler hostnames.
  const lookupRef = url.searchParams.get("cluster");
  if (lookupRef) {
    if (!/^[a-z0-9]{16,32}$/.test(lookupRef)) {
      return NextResponse.json(
        { ok: false, reason: "invalid project ref" },
        { status: 400 },
      );
    }
    const region = url.searchParams.get("region") ?? "eu-west-3";
    if (!/^[a-z]{2}-[a-z]+-\d$/.test(region)) {
      return NextResponse.json(
        { ok: false, reason: "invalid region" },
        { status: 400 },
      );
    }
    const clusters = await findPoolerCluster(lookupRef, region);
    const match = clusters.find((c) => c.hostsProject);
    return NextResponse.json(
      {
        ok: Boolean(match),
        projectRef: lookupRef,
        region,
        clusters,
        message: match
          ? `Le projet est hébergé sur ${match.host}`
          : "Aucun cluster ne reconnaît ce projet.",
      },
      { status: match ? 200 : 404 },
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { ok: false, reason: "DATABASE_URL not configured" },
      { status: 503 },
    );
  }

  const params = url.searchParams;
  const wake = params.get("wake");

  // Which pooler endpoint actually answers? Only ever reports redacted URLs.
  if (params.get("probe")) {
    const endpoints = await probeConnections();
    const working = endpoints.find((e) => e.ok);
    return NextResponse.json(
      {
        ok: Boolean(working),
        projectRef: projectRef(),
        endpoints,
        message: working
          ? `Endpoint fonctionnel : ${working.endpoint}`
          : "Aucun endpoint ne répond. Vérifiez DATABASE_URL.",
      },
      { status: working ? 200 : 503 },
    );
  }

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
