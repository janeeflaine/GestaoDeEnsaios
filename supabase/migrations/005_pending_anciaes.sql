-- ============================================================
-- Migration 005: Pending anciaes requests + custom ancião on stats
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Custom ancião name on event_statistics ────────────────
ALTER TABLE event_statistics
  ADD COLUMN IF NOT EXISTS anciao_nome_custom TEXT DEFAULT NULL;

-- ── 2. Pending anciaes requests table ───────────────────────
CREATE TABLE IF NOT EXISTS pending_anciaes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  requester_name TEXT,
  stat_id     UUID REFERENCES event_statistics(id) ON DELETE SET NULL,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. RLS for pending_anciaes ───────────────────────────────
ALTER TABLE pending_anciaes ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "pending_anciaes_admin_all" ON pending_anciaes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Any authenticated user can insert (their own request)
CREATE POLICY "pending_anciaes_insert_auth" ON pending_anciaes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can see their own requests
CREATE POLICY "pending_anciaes_select_own" ON pending_anciaes
  FOR SELECT USING (requested_by = auth.uid());
