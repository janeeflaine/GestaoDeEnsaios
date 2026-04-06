-- ============================================================
-- Migration 002: Soft delete for events
-- Run this in: Supabase Dashboard → SQL Editor
--
-- Problem: Hard-deleting events destroys history and breaks
-- any existing presences/statistics that reference them.
-- Solution: Add a deleted_at column; queries filter it out.
-- ============================================================

-- 1. Add the column (idempotent — safe to run multiple times)
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Index for fast filtering (WHERE deleted_at IS NULL)
CREATE INDEX IF NOT EXISTS idx_events_deleted_at ON events (deleted_at)
  WHERE deleted_at IS NULL;

-- 3. Update the RLS SELECT policy to hide soft-deleted rows
--    (only needed if you have a policy that filters by user/role;
--     adjust the policy name to match what exists in your project)
--
-- Example — drop & recreate SELECT policy:
--
-- DROP POLICY IF EXISTS "events_select" ON events;
-- CREATE POLICY "events_select" ON events
--   FOR SELECT USING (deleted_at IS NULL);
--
-- If you don't have RLS on events yet, enable and add policies
-- after running migration 003.
