-- ─────────────────────────────────────────────────────────────
-- Security hardening for Supabase (or any Postgres exposed via an
-- auto-generated REST API such as PostgREST).
--
-- The app connects DIRECTLY to Postgres as the table owner (`postgres`) using
-- DATABASE_URL, which bypasses RLS. Supabase additionally exposes the `public`
-- schema over a public REST API using the `anon` role. These statements enable
-- Row Level Security with NO policies, which denies the API roles all access
-- while leaving the app (owner) fully functional.
--
-- Run once after applying the schema (`npm run db:push` / db:migrate):
--   psql "$DATABASE_URL" -f scripts/enable-rls.sql
-- On Supabase you can also paste this into the SQL editor.
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.tenants        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_states   ENABLE ROW LEVEL SECURITY;

-- Defense in depth: explicitly revoke privileges from the public API roles.
-- (These roles exist on Supabase; the statements are no-ops elsewhere if the
-- roles are absent — wrap in a DO block to stay portable.)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON public.tenants        FROM anon, authenticated;
    REVOKE ALL ON public.admin_users    FROM anon, authenticated;
    REVOKE ALL ON public.webhook_events FROM anon, authenticated;
    REVOKE ALL ON public.oauth_states   FROM anon, authenticated;
  END IF;
END $$;
