import "server-only";
import { desc, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { newsletterSubscribers } from "@/lib/db/schema";

export type Subscriber = { email: string; source: string; createdAt: Date };

/**
 * Record a sign-up. Re-subscribing is not an error — the visitor asked to be on
 * the list and already is, so keep the original date and report success.
 * Returns false only when there is no database to write to, so the caller can
 * avoid telling someone they are subscribed when nothing was stored.
 */
export async function addSubscriber(
  email: string,
  source = "footer",
): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  await db
    .insert(newsletterSubscribers)
    .values({ email: email.toLowerCase(), source })
    .onConflictDoNothing();
  return true;
}

export async function listSubscribers(limit = 500): Promise<Subscriber[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(newsletterSubscribers)
    .orderBy(desc(newsletterSubscribers.createdAt))
    .limit(limit);
  return rows.map((r) => ({
    email: r.email,
    source: r.source,
    createdAt: r.createdAt,
  }));
}

export async function countSubscribers(): Promise<number> {
  const db = getDb();
  if (!db) return 0;
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(newsletterSubscribers);
  return row?.n ?? 0;
}
