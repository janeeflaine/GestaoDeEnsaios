-- ============================================================
-- Migration 004: Statistics per user + sharing
-- Run this in: Supabase Dashboard → SQL Editor
--
-- Changes:
--   1. Add created_by (UUID, FK to auth.users) to event_statistics
--   2. Add share_token (UUID, nullable) for WhatsApp sharing
--   3. Assign legacy rows to gestor@ccb.com
--   4. Enable RLS with per-user isolation + public share-token read
--   5. RPC function for safe share-token lookup (SECURITY DEFINER)
-- ============================================================

-- ── 1. New columns ───────────────────────────────────────────
ALTER TABLE event_statistics
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT NULL;

-- Index for fast token lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_statistics_share_token
  ON event_statistics (share_token)
  WHERE share_token IS NOT NULL;

-- ── 2. Assign legacy rows to gestor@ccb.com ──────────────────
UPDATE event_statistics
SET created_by = (
  SELECT id FROM auth.users WHERE email = 'gestor@ccb.com' LIMIT 1
)
WHERE created_by IS NULL;

-- ── 3. Enable RLS ────────────────────────────────────────────
ALTER TABLE event_statistics ENABLE ROW LEVEL SECURITY;

-- Drop any old policies first
DROP POLICY IF EXISTS "stats_select_own"         ON event_statistics;
DROP POLICY IF EXISTS "stats_select_shared"       ON event_statistics;
DROP POLICY IF EXISTS "stats_insert_auth"         ON event_statistics;
DROP POLICY IF EXISTS "stats_update_own"          ON event_statistics;
DROP POLICY IF EXISTS "stats_delete_own"          ON event_statistics;

-- Owner can see their own rows
CREATE POLICY "stats_select_own" ON event_statistics
  FOR SELECT USING (created_by = auth.uid());

-- Anyone (even anon) can read a row by its share_token via the RPC below.
-- We do NOT expose all shared rows — the RPC is the only public access path.

-- Only authenticated users can insert (with their own uid)
CREATE POLICY "stats_insert_auth" ON event_statistics
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND created_by = auth.uid()
  );

-- Only owner can update
CREATE POLICY "stats_update_own" ON event_statistics
  FOR UPDATE USING (created_by = auth.uid());

-- Only owner can delete
CREATE POLICY "stats_delete_own" ON event_statistics
  FOR DELETE USING (created_by = auth.uid());

-- ── 4. RPC: get_stat_by_share_token ──────────────────────────
-- SECURITY DEFINER bypasses RLS so any caller (even anon) can
-- fetch a single row by its public share_token.
CREATE OR REPLACE FUNCTION get_stat_by_share_token(p_token UUID)
RETURNS SETOF event_statistics
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT * FROM event_statistics WHERE share_token = p_token LIMIT 1;
$$;
