-- ============================================================
-- Migration 006: Pending conductors requests + custom enc. regionais on stats
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Custom enc. regionais names on event_statistics ───────
ALTER TABLE event_statistics
  ADD COLUMN IF NOT EXISTS enc_regionais_nomes_custom TEXT[] DEFAULT NULL;

-- ── 2. Pending conductors requests table ─────────────────────
CREATE TABLE IF NOT EXISTS pending_conductors (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  congregation  TEXT,
  requested_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  requester_name TEXT,
  stat_id       UUID REFERENCES event_statistics(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. RLS for pending_conductors ────────────────────────────
ALTER TABLE pending_conductors ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "pending_conductors_admin_all" ON pending_conductors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Any authenticated user can insert (their own request)
CREATE POLICY "pending_conductors_insert_auth" ON pending_conductors
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can see their own requests
CREATE POLICY "pending_conductors_select_own" ON pending_conductors
  FOR SELECT USING (requested_by = auth.uid());
