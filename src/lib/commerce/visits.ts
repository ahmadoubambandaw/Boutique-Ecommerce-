import "server-only";
import { gte, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { visits } from "@/lib/db/schema";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Increment today's visit counter (one call per storefront session). */
export async function recordVisit(): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .insert(visits)
    .values({ day: today(), count: 1 })
    .onConflictDoUpdate({
      target: visits.day,
      set: { count: sql`${visits.count} + 1` },
    });
}

/** Total visits over the last `days` days (default 12 weeks). */
export async function countVisits(days = 84): Promise<number> {
  const db = getDb();
  if (!db) return 0;
  const since = new Date(Date.now() - days * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const rows = await db.select().from(visits).where(gte(visits.day, since));
  return rows.reduce((n, r) => n + r.count, 0);
}
